 # 工作养生 App ProGuard 规则
 # 保留 WebView 相关的类
 -keepclassmembers class * {
     @android.webkit.JavascriptInterface <methods>;
 }
 
 -keep class com.workwellness.app.** { *; }
 
 # Kotlin/Jetpack
 -keep class androidx.** { *; }
 -dontwarn androidx.**
