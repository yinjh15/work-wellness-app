 @rem Gradle startup script for Windows
 @rem Set local scope
 if "%OS%"=="Windows_NT" setlocal
 
 set DIRNAME=%~dp0
 if "%DIRNAME%"=="" set DIRNAME=.
 
 @rem Add default JVM options here.
 set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
 
 set CLASSPATH=%DIRNAME%\gradle\wrapper\gradle-wrapper.jar
 
 @rem Execute Gradle
 "%JAVA_HOME%/bin/java.exe" %DEFAULT_JVM_OPTS% -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
 
 :end
 @rem End local scope
 endlocal & set EXIT_CODE=%ERRORLEVEL%
 exit /b %EXIT_CODE%
