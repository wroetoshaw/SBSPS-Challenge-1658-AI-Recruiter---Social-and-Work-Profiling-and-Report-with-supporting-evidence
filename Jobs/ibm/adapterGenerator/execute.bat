echo "adapter-gen started"

set webinfpath=%1
REM Below /D option is required if MFP installed on device drive other than C on Windows
cd /D %webinfpath%

set MAVEN_HOME=%1\lib\buildtools\maven\bin\mvn
echo "Maven Home : "%MAVEN_HOME%
echo "Generating libraries for adapter generator"
call %MAVEN_HOME% clean install -Pcompile-generator
echo "Generating source for adapter"
call %MAVEN_HOME% generate-sources -Padapter-generator
echo "Compiling Client"
call %MAVEN_HOME% clean install -Pcompile-client
echo "Building Adapter"
call %MAVEN_HOME% clean install -Pbuild-adapter