#!/bin/bash
echo "adapter-gen started"
echo $1
cd $1

echo "Previous Value of Java home is::"$JAVA_HOME

#Setting Java Home to work on Bluemix Cloud Environment
if [ "$2" = "Cloud" ]; then
    #export JAVA_HOME=$1/lib/buildtools/ibm-java
    export JAVA_HOME=/home/vcap/app/wlp/usr/servers/adapterGenerator/resources/ibm-java
   	# chmod -R 777 $JAVA_HOME
   	# chmod -R 777 "$JAVA_HOME"
    echo "Current Value of Java home is ::"$JAVA_HOME
fi


MAVEN_HOME=$1/lib/buildtools/maven/bin/mvn
echo "Maven Home : "$MAVEN_HOME
echo "Generating libraries for adapter generator"
$MAVEN_HOME -U clean install -Pcompile-generator
echo "Generating source for adapter"
$MAVEN_HOME generate-sources -Padapter-generator
echo "Compiling Client"
$MAVEN_HOME clean install -Pcompile-client
echo "Building Adapter"
$MAVEN_HOME clean install -Pbuild-adapter