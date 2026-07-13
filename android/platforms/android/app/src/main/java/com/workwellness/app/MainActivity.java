 package com.workwellness.app;

 import android.app.NotificationChannel;
 import android.app.NotificationManager;
 import android.os.Build;
 import android.os.Bundle;
 import android.webkit.WebChromeClient;
 import android.webkit.WebResourceRequest;
 import android.webkit.WebSettings;
 import android.webkit.WebView;
 import android.webkit.WebViewClient;
 import androidx.appcompat.app.AppCompatActivity;
 import android.view.WindowManager;

 /**
  * 工作养生 App - 主 Activity
  *
  * 离线 Android 应用，将 Web 应用打包在 APK 内，
  * 通过 WebView 加载本地资源，实现完全离线运行。
  */
 public class MainActivity extends AppCompatActivity {

     private WebView webView;
     private static final String CHANNEL_ID = "work_wellness_notifications";

     @Override
     protected void onCreate(Bundle savedInstanceState) {
         super.onCreate(savedInstanceState);

         // 全屏沉浸模式
         getWindow().setFlags(
             WindowManager.LayoutParams.FLAG_FULLSCREEN,
             WindowManager.LayoutParams.FLAG_FULLSCREEN
         );

         setContentView(R.layout.activity_main);

         // 创建通知渠道（Android 8.0+）
         createNotificationChannel();

         // 初始化 WebView
         webView = findViewById(R.id.webView);
         setupWebView();

         // 加载本地 HTML
         webView.loadUrl("file:///android_asset/www/index.html");
     }

     private void setupWebView() {
         WebSettings settings = webView.getSettings();

         // 启用 JavaScript
         settings.setJavaScriptEnabled(true);

         // 启用 DOM 存储（localStorage 需要）
         settings.setDomStorageEnabled(true);
         settings.setDatabaseEnabled(true);
         settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

         // 本地文件访问
         settings.setAllowFileAccess(true);
         settings.setAllowFileAccessFromFileURLs(true);
         settings.setAllowUniversalAccessFromFileURLs(true);

         // 性能优化
         settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
         settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);
         settings.setLoadWithOverviewMode(true);
         settings.setUseWideViewPort(true);

         // 禁用缩放
         settings.setBuiltInZoomControls(false);
         settings.setDisplayZoomControls(false);
         settings.setSupportZoom(false);

         // 硬件加速
         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
             webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
         }

         // 设置 WebChromeClient
         webView.setWebChromeClient(new WebChromeClient());

         // 设置 WebViewClient - 确保所有链接在 WebView 内打开
         webView.setWebViewClient(new WebViewClient() {
             @Override
             public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                 String url = request.getUrl().toString();
                 // 只允许加载本地资源
                 if (url.startsWith("file:///android_asset/")) {
                     return false;
                 }
                 return true;
             }

             @Override
             public void onPageFinished(WebView view, String url) {
                 super.onPageFinished(view, url);
                 // 页面加载完成后隐藏启动屏（可通过 JS 控制）
             }
         });

         // 移除滚动条和边缘效果
         webView.setVerticalScrollBarEnabled(false);
         webView.setHorizontalScrollBarEnabled(false);
         webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
     }

     /**
      * 创建通知渠道（Android 8.0+）
      */
     private void createNotificationChannel() {
         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
             NotificationChannel channel = new NotificationChannel(
                 CHANNEL_ID,
                 "工作养生提醒",
                 NotificationManager.IMPORTANCE_HIGH
             );
             channel.setDescription("活动提醒和饮水提醒通知");
             channel.enableVibration(true);
             channel.setVibrationPattern(new long[]{0, 500, 200, 500});

             NotificationManager manager = getSystemService(NotificationManager.class);
             if (manager != null) {
                 manager.createNotificationChannel(channel);
             }
         }
     }

     /**
      * 处理系统返回键 - 退出应用
      */
     @Override
     public void onBackPressed() {
         // 直接退出（因为应用只有一个页面）
         finish();
     }
 }
