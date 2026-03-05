package kr.co.siggy.family.common;

import java.util.HashMap;

@SuppressWarnings("rawtypes")
public class CamelCaseMap extends HashMap<String, Object> {

	private static final long serialVersionUID = -4468386386251444061L;
	@Override
	public Object put(String key, Object value) {
		return super.put(convertToCamelCase((String) key), value);

	}
	private String convertToCamelCase(String underScore) {
		if (underScore.indexOf('_') < 0) {
			return underScore.toLowerCase();
		}

		StringBuilder result = new StringBuilder();
		boolean nextUpper = false;
		int len = underScore.length();
		for (int i = 0; i < len; i++) {
			char currentChar = underScore.charAt(i);
			if (currentChar == '_') {
				nextUpper = true;
			} else if (nextUpper) {
				result.append(Character.toUpperCase(currentChar));
				nextUpper = false;
			} else {
				result.append(Character.toLowerCase(currentChar));
			}
		}

		return result.toString();
	}
}