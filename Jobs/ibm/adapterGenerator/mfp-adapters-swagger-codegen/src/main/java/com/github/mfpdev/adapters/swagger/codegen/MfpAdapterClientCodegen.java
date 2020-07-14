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

import org.apache.commons.lang3.StringUtils;
import io.swagger.codegen.languages.JavaClientCodegen;

/*
 * Extends Swagger default Java Client codegen 
 */
public class MfpAdapterClientCodegen extends JavaClientCodegen  {
	
	@Override
	public String toApiName(String name) {
        if (name.length() == 0 || name.isEmpty() || name.equals("Default")) {
            return "DefaultClientApi";
        }
        return initialCaps(name) + "ClientApi";
		}
	
	@SuppressWarnings("static-method")
    public String initialCaps(String name) {
        return StringUtils.capitalize(name);
}
	
	
}