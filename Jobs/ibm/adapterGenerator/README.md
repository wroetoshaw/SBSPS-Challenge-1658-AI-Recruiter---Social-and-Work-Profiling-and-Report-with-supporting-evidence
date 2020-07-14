About this README
===============
Use this README if you have selected ‘Include Source’ checkbox while generating adapter.

This README helps you in understanding the folder structure of the downloaded adapter source code in order for you to make changes to the adapter source code and build it.

Generated Adapter
===============
Once you Unzip the generated adapter zip file, the root folder, will have the following structure :

build.xml
client-api
generatedAdapter
README.md

build.xml
The maven pom file for building the adapter locally.

client-api
This folder contains the generated client library classes from the OpenAPI specification and is used for building the adapter

generatedAdapter
This folder contains the generated adapter and adapter maven project that contains the adapter source code. The class that are under the package “com.ibm.mfp.adapters.sample.api” contains the JAX-RS implementation of adapter code and the package “com.ibm.mfp.adapters.sample.model” contains the model class that corresponds to the different schemas defined in the OpenAPI specification.

How to Build Adapter
===================
If you are making any changes to the generated Adapter source code, you need to rebuild the adapter.

Before building the adapter, make sure you have following prerequiste

1) Maven needs to be installed.
2) JDK installed and JAVA_HOME set to JDK path.

To build the adapter, run the following command from the root folder

mvn -f build.xml clean install  
