/*
 *  IBM Confidential OCO Source Materials
 *
 *  5725-I43 Copyright IBM Corp. 2011, 2016
 *
 *  The source code for this program is not published or otherwise
 *  divested of its trade secrets, irrespective of what has
 *  been deposited with the U.S. Copyright Office.
 *
 */
package com.github.mfpdev.adapters.swagger.codegen;

import io.swagger.codegen.CodegenConstants;
import io.swagger.codegen.CodegenOperation;
import io.swagger.codegen.CodegenParameter;
import io.swagger.codegen.CodegenResponse;
import io.swagger.codegen.CodegenType;
import io.swagger.codegen.CodegenOperation;
import io.swagger.codegen.CodegenResponse;
import io.swagger.codegen.CodegenSecurity;
import io.swagger.codegen.CodegenType;
import io.swagger.codegen.SupportingFile;
import io.swagger.models.Operation;
import io.swagger.codegen.languages.JavaJerseyServerCodegen;
import io.swagger.models.properties.ArrayProperty;
import io.swagger.models.properties.MapProperty;
import io.swagger.models.properties.Property;
import io.swagger.models.Swagger;
import io.swagger.models.Path;
import io.swagger.models.Swagger;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.WordUtils;
import io.swagger.models.auth.SecuritySchemeDefinition;
/*
 * Extends Swagger default Jaxrs codegen and customizes for MFP JavaAdapter requirements
 */
public class MfpAdapterCodegen extends JavaJerseyServerCodegen  {

  private static final String SERVICE_FACTORY_CLASSNAME = "serviceFactoryClassname";
  private static final String AUTO_WIRED_SPRING_SERVICE = "autowiredSpringService";
  // source folder where to write the files
  //protected String sourceFolder = "src";
  protected String apiVersion = "1.0.0";
  protected boolean voidReturnType = true;
  protected boolean isOnlyHttpScheme = false ;
  private String modelImportPackage;
  /**
   * Configures the type of generator.
   *
   * @return  the CodegenType for this generator
   * @see     io.swagger.codegen.CodegenType
   */
  public CodegenType getTag() {
    return CodegenType.SERVER;
  }

  /**
   * Configures a friendly name for the generator.  This will be used by the generator
   * to select the library with the -l flag.
   *
   * @return the friendly name for the generator
   */
  public String getName() {
    return "MFPAdapter";
  }

  /**
   * Returns human-friendly help for the generator.  Provide the consumer with help
   * tips, parameters here
   *
   * @return A string value for the help message
   */
  public String getHelp() {
    return "Generates a MFPAdapter client library.";
  }

  public MfpAdapterCodegen() {
    super();

    // set the output folder here
    outputFolder = "./java/main/generated";
     dateLibrary = "joda";

    /**
     * Models.  You can write model files using the modelTemplateFiles map.
     * if you want to create one template for file, you can do so here.
     * for multiple files for model, just put another entry in the `modelTemplateFiles` with
     * a different extension
     */
    modelTemplateFiles.put(
      "model.mustache", // the template to use
      ".java");       // the extension for each file to write

    /**
     * Api classes.  You can write classes for each Api file with the apiTemplateFiles map.
     * as with models, add multiple entries with different extensions for multiple files per
     * class
     */
    apiTemplateFiles.put("api.mustache", ".java");
    apiTemplateFiles.put("apiService.mustache", ".java");

        //remove templates added by base classes since they are not relevant here
    apiTemplateFiles.remove("apiServiceImpl.mustache");
    apiTemplateFiles.remove("apiServiceFactory.mustache");



    /**
     * Template Location.  This is the location which templates will be read from.  The generator
     * will use the resource stream to attempt to read the templates.
     */
    embeddedTemplateDir = templateDir = "MFPAdapter";

    /**
     * Api Package.  Optional, if needed, this can be used in templates
     */
    apiPackage = "com.ibm.mfp.adapters.sample.api";

    /**
     * Model Package.  Optional, if needed, this can be used in templates
     */
    modelPackage = "com.ibm.mfp.adapters.sample.model";

   /**
     Generic import pacakge that can be used for both api and model import
    */
    modelImportPackage = "com.ibm.mfp.adapters.sample";

    sourceFolder = ".";

    /**
     * Reserved words.  Override this with reserved words specific to your language
     */
    /*reservedWords = new HashSet<String> (
      Arrays.asList(
        "sample1",  // replace with static values
        "sample2")
    );*/

    /**
     * Additional Properties.  These values can be passed to the templates and
     * are available in models, apis, and supporting files
     */
    additionalProperties.put("apiVersion", apiVersion);

    additionalProperties.put("voidReturnType", voidReturnType);
   
    additionalProperties.put("modelImportPackage", modelImportPackage);

    /**
     * Supporting Files.  You can write single files for the generator with the
     * entire object tree available.  If the input file has a suffix of `.mustache
     * it will be processed by the template engine.  Otherwise, it will be copied
     */
    /* supportingFiles.add(new SupportingFile("myFile.mustache",   // the input template or file
      "",                                                       // the destination folder, relative `outputFolder`
      "myFile.sample")                                          // the output file
    );*/

    /**
     * Language Specific Primitives.  These types will not trigger imports by
     * the client generator
     */
    /*languageSpecificPrimitives = new HashSet<String>(
      Arrays.asList(
        "Type1",      // replace these with your types
        "Type2")
    );*/
  }

  @Override
  public void processOpts() {
      super.processOpts();

      String adapterJaxrsApplication = (additionalProperties.get("adapterApplicationClassname")) != null ?
    		  								(String)(additionalProperties.get("adapterApplicationClassname")) + ".java" : "DefaultAdapterApplication.java";

      if ( additionalProperties.containsKey(CodegenConstants.IMPL_FOLDER) ) {
          implFolder = (String) additionalProperties.get(CodegenConstants.IMPL_FOLDER);
      }

      if ( additionalProperties.containsKey(SERVICE_FACTORY_CLASSNAME) ) {
    	  apiTemplateFiles.put("apiServiceFactoryIfc.mustache", ".java");
    	  apiTemplateFiles.put("apiServiceFactoryFinder.mustache", ".java");
    	  apiTemplateFiles.put("apiServiceFactoryFinderException.mustache", ".java");
      }

      if ( additionalProperties.containsKey(AUTO_WIRED_SPRING_SERVICE) ) {
    	  Boolean value = Boolean.valueOf((String)additionalProperties.get(AUTO_WIRED_SPRING_SERVICE));
    	  if ( !value.booleanValue() ) {
    		  additionalProperties.remove(AUTO_WIRED_SPRING_SERVICE);
    	  }
      }

      supportingFiles.clear();
      supportingFiles.add(new SupportingFile("pom.mustache", "", "pom.xml"));
      supportingFiles.add(new SupportingFile("adapter.mustache", "/src/main/adapter-resources", "adapter.xml"));
      supportingFiles.add(new SupportingFile("adapterJaxrsApplication.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), adapterJaxrsApplication));
      //writeOptional(outputFolder, new SupportingFile("README.mustache", "", "README.md"));
      supportingFiles.add(new SupportingFile("ApiException.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "ApiException.java"));
      supportingFiles.add(new SupportingFile("ApiResponseMessage.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "ApiResponseMessage.java"));
      supportingFiles.add(new SupportingFile("NotFoundException.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "NotFoundException.java"));

    //  additionalProperties.put(dateLibrary, "joda");

      /*if ( additionalProperties.containsKey("dateLibrary") ) {
          setDateLibrary(additionalProperties.get("dateLibrary").toString());
          additionalProperties.put(dateLibrary, "true");
      }*/
     // System.out.println("****************************************");
     // System.out.println(dateLibrary);

      if ( "joda".equals(dateLibrary) ) {
          supportingFiles.add(new SupportingFile("JodaDateTimeProvider.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "JodaDateTimeProvider.java"));
          supportingFiles.add(new SupportingFile("JodaLocalDateProvider.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "JodaLocalDateProvider.java"));
      } else if ( "java8".equals(dateLibrary) ) {
          supportingFiles.add(new SupportingFile("LocalDateTimeProvider.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "LocalDateTimeProvider.java"));
          supportingFiles.add(new SupportingFile("LocalDateProvider.mustache", (sourceFolder + "/src/main/java/" + apiPackage).replace(".", "/"), "LocalDateProvider.java"));
      }
  }

  @Override
  public String apiFilename(String templateName, String tag) {
      String result = super.apiFilename(templateName, tag);

      if ( templateName.endsWith("Impl.mustache") ) {
          int ix = result.lastIndexOf('/');
          result = result.substring(0, ix) + "/impl" + result.substring(ix, result.length() - 5) + "ServiceImpl.java";
          result = result.replace(apiFileFolder(), implFileFolder(implFolder));
      } else if ( templateName.endsWith("FactoryFinder.mustache") ) {
    	  int ix = result.lastIndexOf('.');
    	  result = result.substring(0, ix) + "ServiceFactoryFinder.java";
      } else if ( templateName.endsWith("FactoryIfc.mustache") ) {
          int ix = result.lastIndexOf('.');
          result = result.substring(0, ix) + "ServiceFactoryIfc.java";
      } else if ( templateName.endsWith("ServiceFactoryFinderException.mustache") ) {
    	  int ix = result.lastIndexOf('/');
    	  result = result.substring(0, ix) + "/ServiceFactoryFinderException.java";
      }
      return result;
  }


  @Override
  public void preprocessSwagger(Swagger swagger) {
	  String scheme = "https";
	  String hostInfo = swagger.getHost();
	  String basePathInfo = swagger.getBasePath();
	  
	  
	  
      if ( "/".equals(swagger.getBasePath()) ) {
          swagger.setBasePath("");
      }

      if (!this.additionalProperties.containsKey("serverPort")) {
          final String host = swagger.getHost();
          String port = "8080"; // Default value for a JEE Server
          if ( host != null ) {
              String[] parts = host.split(":");
              if ( parts.length > 1 ) {
                  port = parts[1];
              }
          }

          this.additionalProperties.put("serverPort", port);
      }
      
     
     	List swaggerSchemeList = swagger.getSchemes();
      	if (null != swaggerSchemeList)
      	{
    	  if(swaggerSchemeList.size() == 1)
    	  	{
    		  if("Http".equalsIgnoreCase(swagger.getSchemes().get(0).toValue()))
    		  {
    			  this.additionalProperties.put("scheme",swaggerSchemeList.get(0));
    			  this.additionalProperties.put("scheme",swaggerSchemeList.get(0));
    			  isOnlyHttpScheme = true ;
    			  scheme = "http";
    			  this.additionalProperties.put("isOnlyHttpScheme",isOnlyHttpScheme);
    		  }
    	  
    	  	}
     	}
      
      	// Forming URL ->scheme://hosts/basePath
      	StringBuilder sb = new StringBuilder();
      	String externalServiceURL = sb.append(scheme).append("://").append(hostInfo).append(basePathInfo).toString();
      	this.additionalProperties.put("externalserviceurl",externalServiceURL);
      	
      	// Get the security definitions and set the flag if both basic and apikey is given
      	
      	Map<String,SecuritySchemeDefinition> authMethods = swagger.getSecurityDefinitions();
      	if(!(null != authMethods || "".isEmpty())) {
      	boolean isBasicAuthSet = false , isApiKeyAuthSet = false ;
      	for (Map.Entry<String, SecuritySchemeDefinition> secSchemeDef : authMethods.entrySet()){
      			    if("basicauth".equalsIgnoreCase(secSchemeDef.getKey()))
      			    	isBasicAuthSet = true;
      			    if("apikeyauth".equalsIgnoreCase(secSchemeDef.getKey()))
      			    	isApiKeyAuthSet = true;
      			    
      			}
      	if(isBasicAuthSet && isApiKeyAuthSet)
      	{
      		// We go ahead with default security mechanism which is basicAuth
      		this.additionalProperties.put("isBothAuthSet",true);
      		
      	}
      }
      	// declare import of SecuritySchemeDefinition
      	
      char[] delimeters={'-',' ','_'};
      if ( swagger.getPaths() != null ) {
          for ( String pathName : swagger.getPaths().keySet() ) {
              Path path = swagger.getPath(pathName);
              if ( path.getOperations() != null ) {
                  for ( Operation operation : path.getOperations() ) {
                	  int tagCount = 0;
                	  List<Map<String, String>> tags = new ArrayList<Map<String, String>>();
                      if ( operation.getTags() != null ) {
                          for ( String tag : operation.getTags() ) {
                        	  if(tagCount==0) {
                              Map<String, String> value = new HashMap<String, String>();
                              tag = WordUtils.capitalize(tag,delimeters).replaceAll("-", "").replaceAll("_", "").replaceAll("\\s", "");
                              // check here to see if the tag name is same as the first part of string in path name
                              // Reason to check : Example:  path is /system/xyz and tags defined is System , then the
                              // system throws compliation issue as there will be class conflict in the generated class
                              String pathNameSubString =null;
                      			if(pathName.indexOf('/', pathName.indexOf('/')+1) > 0) // Ex : For Path Pattern "/system/xyz/abc"
                              {
                              pathNameSubString = pathName.substring(1,pathName.indexOf('/', pathName.indexOf('/')+1));
                              }
                              else // Ex : For Pattern "/system"
                              {
                              pathNameSubString = pathName.substring(1,pathName.length());
                              }
                      		
                              value.put("tag", tag);
                              value.put("hasMore", "true");
                              tags.add(value);
                              tagCount++;
                        	  }

                          }
                          if ( tags.size() > 0 ) {
                              tags.get(tags.size() - 1).remove("hasMore");
                          }
                          if ( operation.getTags().size() > 0 ) {
                              String tag = operation.getTags().get(0);
                              operation.setTags(Arrays.asList(tag));
                          }
                          operation.setVendorExtension("x-tags", tags);
                      }
                      else{
                    	  Map<String, String> value = new HashMap<String, String>();
                    	  value.put("tag", "Default");
                          value.put("hasMore", "true");
                          tags.add(value);
                          operation.setVendorExtension("x-tags", tags);
                      }
                      
                  }
              }
          }
      }
  }


  private String implFileFolder(String output) {
      return outputFolder + "/" + output + "/src/main/java/" + apiPackage().replace('.', '/');
  }

  /**
   * Escapes a reserved word as defined in the `reservedWords` array. Handle escaping
   * those terms here.  This logic is only called if a variable matches the reseved words
   *
   * @return the escaped term
   */
  @Override
  public String escapeReservedWord(String name) {
    return "_" + name;  // add an underscore to the name
  }

  /**
   * Location to write model files.  You can use the modelPackage() as defined when the class is
   * instantiated
   */
  @Override
  public String modelFileFolder() {
    return outputFolder + "/" + sourceFolder + "/src/main/java/" + modelPackage().replace('.', File.separatorChar);
  }

  /**
   * Location to write api files.  You can use the apiPackage() as defined when the class is
   * instantiated
   */
  @Override
  public String apiFileFolder() {
    return outputFolder + "/" + sourceFolder + "/src/main/java/" + apiPackage().replace('.', File.separatorChar);
  }

  @Override
  public String outputFolder() {
      return outputFolder;
  }

  @Override
  public String getOutputDir() {
      return outputFolder();
  }

  @Override
  public void setOutputDir(String dir) {
      this.outputFolder = dir;
  }

  public String toCamelCase(String tagName)
  {
      String result = "";
      char firstChar = tagName.charAt(0);
      result = result + Character.toUpperCase(firstChar);
      for (int i = 1; i < tagName.length(); i++) {
          char currentChar = tagName.charAt(i);
          char previousChar = tagName.charAt(i - 1);
          if (previousChar == ' ') {
              result = result + Character.toUpperCase(currentChar);
          } else {
              result = result + currentChar;
          }
      }

      return result;
  }
}