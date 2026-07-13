import UIKit
import WebKit
import UserNotifications

class ViewController: UIViewController {

    private var webView: WKWebView!
    private var bridge: WebViewBridge!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadLocalHTML()
        NotificationCenter.default.addObserver(
            self, selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification, object: nil
        )
    }

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        bridge = WebViewBridge(viewController: self)
        userContentController.add(bridge, name: "notifyBridge")
        userContentController.add(bridge, name: "vibrateBridge")
        userContentController.add(bridge, name: "scheduleBridge")
        userContentController.add(bridge, name: "cancelBridge")
        userContentController.add(bridge, name: "getPendingBridge")

        if let bridgePath = Bundle.main.path(forResource: "js/ios-bridge", ofType: "js"),
           let bridgeJS = try? String(contentsOfFile: bridgePath, encoding: .utf8) {
            let script = WKUserScript(source: bridgeJS, injectionTime: .atDocumentStart, forMainFrameOnly: false)
            userContentController.addUserScript(script)
        }

        config.userContentController = userContentController
        config.preferences.javaScriptEnabled = true
        if #available(iOS 14.0, *) {
            config.defaultWebpagePreferences.allowsContentJavaScript = true
        }

        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.scrollView.isScrollEnabled = false
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 26/255, green: 10/255, blue: 46/255, alpha: 1)
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
    }

    private func loadLocalHTML() {
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            fatalError("无法加载 www/index.html")
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    @objc func appDidBecomeActive() {
        webView.evaluateJavaScript("window.handleAppResume ? window.handleAppResume() : null", completionHandler: nil)
    }

    override var prefersStatusBarHidden: Bool { return true }
    override var preferredStatusBarStyle: UIStatusBarStyle { return .lightContent }
}

// MARK: - WebView Bridge
class WebViewBridge: NSObject, WKScriptMessageHandler {

    weak var viewController: UIViewController?
    init(viewController: UIViewController) { self.viewController = viewController }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "notifyBridge":
            guard let body = message.body as? [String: String],
                  let title = body["title"],
                  let content = body["content"] else { return }
            sendLocalNotification(title: title, content: content)

        case "vibrateBridge":
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()

        case "scheduleBridge":
            guard let data = message.body as? [String: Any],
                  let activityMin = data["activityInterval"] as? Int,
                  let waterMin = data["waterInterval"] as? Int else { return }
            scheduleBackgroundNotifications(activityInterval: activityMin, waterInterval: waterMin)

        case "cancelBridge":
            cancelAllPendingNotifications()

        case "getPendingBridge":
            getPendingNotificationCount()

        default:
            break
        }
    }

    private func sendLocalNotification(title: String, content: String) {
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            guard settings.authorizationStatus == .authorized else { return }
            let nc = UNMutableNotificationContent()
            nc.title = title
            nc.body = content
            nc.sound = .default
            nc.categoryIdentifier = "work_wellness"
            let request = UNNotificationRequest(
                identifier: UUID().uuidString,
                content: nc,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
            )
            center.add(request) { error in
                if let error = error { print("通知失败: \(error.localizedDescription)") }
            }
        }
    }

    /// 调度后台通知 - 当 App 在后台或关闭时，iOS 仍会准时推送
    private func scheduleBackgroundNotifications(activityInterval: Int, waterInterval: Int) {
        cancelAllPendingNotifications()
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            guard settings.authorizationStatus == .authorized else { return }

            let activityContent = UNMutableNotificationContent()
            activityContent.title = "该起身活动了！"
            activityContent.body = "已经连续工作一段时间了，站起来走一走吧！"
            activityContent.sound = .default
            activityContent.categoryIdentifier = "work_wellness_activity"
            activityContent.userInfo = ["type": "activity"]

            let activityTrigger = UNTimeIntervalNotificationTrigger(
                timeInterval: TimeInterval(activityInterval * 60), repeats: true
            )
            let activityRequest = UNNotificationRequest(
                identifier: "work_wellness_activity", content: activityContent, trigger: activityTrigger
            )

            let waterContent = UNMutableNotificationContent()
            waterContent.title = "该喝水了！"
            waterContent.body = "工作再忙也要记得补充水分，喝杯纯净水吧！"
            waterContent.sound = .default
            waterContent.categoryIdentifier = "work_wellness_water"
            waterContent.userInfo = ["type": "water"]

            let waterTrigger = UNTimeIntervalNotificationTrigger(
                timeInterval: TimeInterval(waterInterval * 60), repeats: true
            )
            let waterRequest = UNNotificationRequest(
                identifier: "work_wellness_water", content: waterContent, trigger: waterTrigger
            )

            center.add(activityRequest) { error in
                if let e = error { print("活动通知调度失败: \(e)") }
            }
            center.add(waterRequest) { error in
                if let e = error { print("喝水通知调度失败: \(e)") }
            }
            print("后台通知已调度: 活动=\(activityInterval)分钟, 喝水=\(waterInterval)分钟")
        }
    }

    private func cancelAllPendingNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        print("所有待处理通知已取消")
    }

    private func getPendingNotificationCount() {
        UNUserNotificationCenter.current().getPendingNotificationRequests { requests in
            let count = requests.count
            DispatchQueue.main.async {
                if let vc = self.viewController as? ViewController {
                    vc.webView.evaluateJavaScript("window.pendingNotificationCount = \(count);", completionHandler: nil)
                }
            }
        }
    }
}
