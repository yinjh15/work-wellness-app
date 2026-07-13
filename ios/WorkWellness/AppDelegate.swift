 import UIKit
 
 @main
 class AppDelegate: UIResponder, UIApplicationDelegate {
 
     var window: UIWindow?
 
     func application(
         _ application: UIApplication,
         didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
     ) -> Bool {
         // 注册通知
         UNUserNotificationCenter.current().delegate = self
         registerNotificationCategories()
 
         return true
     }
 
     // MARK: UISceneSession Lifecycle
 
     func application(
         _ application: UIApplication,
         configurationForConnecting connectingSceneSession: UISceneSession,
         options: UIScene.ConnectionOptions
     ) -> UISceneConfiguration {
         return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
     }
 
     private func registerNotificationCategories() {
         let center = UNUserNotificationCenter.current()
         center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
             if granted {
                 DispatchQueue.main.async {
                     UIApplication.shared.registerForRemoteNotifications()
                 }
             }
         }
     }
 }
 
 // MARK: - UNUserNotificationCenterDelegate
 extension AppDelegate: UNUserNotificationCenterDelegate {
     func userNotificationCenter(
         _ center: UNUserNotificationCenter,
         willPresent notification: UNNotification,
         withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
     ) {
         // 应用在前台时也显示通知
         completionHandler([.banner, .sound, .list])
     }
 }
