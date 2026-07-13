 import UIKit
 
 class SceneDelegate: UIResponder, UIWindowSceneDelegate {
 
     var window: UIWindow?
 
     func scene(
         _ scene: UIScene,
         willConnectTo session: UISceneSession,
         options connectionOptions: UIScene.ConnectionOptions
     ) {
         guard let windowScene = (scene as? UIWindowScene) else { return }
 
         let window = UIWindow(windowScene: windowScene)
         window.rootViewController = ViewController()
         window.makeKeyAndVisible()
         self.window = window
     }
 
     func sceneDidEnterBackground(_ scene: UIScene) {
         // 应用进入后台时保存状态
         UserDefaults.standard.synchronize()
     }
 }
