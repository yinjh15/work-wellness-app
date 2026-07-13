 @echo off
 chcp 65001 >nul
 title 工作养生 Android 构建工具
 
 echo ============================================
 echo    工作养生 App - Android 离线版构建工具
 echo ============================================
 echo.
 
 REM 检查 Java
 java -version >nul 2>&1
 if %errorlevel% neq 0 (
     echo [错误] 未找到 Java。请安装 JDK 17+。
     echo 下载地址: https://adoptium.net/
     pause
     exit /b 1
 )
 echo [OK] Java 已安装
 
 REM 检查 Gradle
 set GRADLE_HOME=%ProgramFiles%\gradle
 gradle --version >nul 2>&1
 if %errorlevel% neq 0 (
     echo [提示] 未找到系统 Gradle，将下载 Gradle Wrapper...
     call :download_gradle_wrapper
 )
 echo [OK] Gradle 已就绪
 
 REM 检查 ANDROID_HOME
 if "%ANDROID_HOME%"=="" (
     if not "%ANDROID_SDK_ROOT%"=="" (
         set ANDROID_HOME=%ANDROID_SDK_ROOT%
     ) else (
         echo [错误] 未设置 ANDROID_HOME 环境变量。
         echo 请安装 Android Studio 并设置 ANDROID_HOME。
         echo 例如: setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
         pause
         exit /b 1
     )
 )
 echo [OK] ANDROID_HOME = %ANDROID_HOME%
 
 echo.
 echo -------------------------------------------
 echo  构建选项:
 echo  1. 构建 Debug APK
 echo  2. 构建 Release APK
 echo  3. 安装到设备
 echo  4. 退出
 echo -------------------------------------------
 echo.
 
 set /p choice="请选择 (1-4): "
 
 if "%choice%"=="1" goto build_debug
 if "%choice%"=="2" goto build_release
 if "%choice%"=="3" goto install_app
 if "%choice%"=="4" exit /b 0
 goto invalid
 
 :build_debug
 echo.
 echo 正在构建 Debug APK...
 gradlew assembleDebug
 if %errorlevel% neq 0 (
     echo [错误] 构建失败
     pause
     exit /b 1
 )
 echo [OK] Debug APK 构建成功！
 echo 输出路径: platforms\android\app\build\outputs\apk\debug\
 pause
 exit /b 0
 
 :build_release
 echo.
 echo 正在构建 Release APK...
 gradlew assembleRelease
 if %errorlevel% neq 0 (
     echo [错误] 构建失败
     pause
     exit /b 1
 )
 echo [OK] Release APK 构建成功！
 echo 输出路径: platforms\android\app\build\outputs\apk\release\
 pause
 exit /b 0
 
 :install_app
 echo.
 echo 正在安装到设备...
 call :build_debug
 if %errorlevel% neq 0 exit /b 1
 echo adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
 adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
 if %errorlevel% neq 0 (
     echo [错误] 安装失败，请确保设备已连接并开启 USB 调试
     pause
     exit /b 1
 )
 echo [OK] 应用已安装到设备！
 pause
 exit /b 0
 
 :invalid
 echo [错误] 无效选项
 pause
 exit /b 1
 
 :download_gradle_wrapper
 echo 正在创建 Gradle Wrapper...
 REM 下载 Gradle Wrapper jar
 powershell -Command "& {Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/gradle/gradle/v8.5.0/gradle/wrapper/gradle-wrapper.jar' -OutFile 'gradle\wrapper\gradle-wrapper.jar'}" 2>nul
 if not exist gradle\wrapper\gradle-wrapper.jar (
     echo [警告] 无法自动下载 Gradle Wrapper
     echo 请手动安装 Gradle: https://gradle.org/install/
     pause
     exit /b 1
 )
 echo [OK] Gradle Wrapper 已创建
 exit /b 0
