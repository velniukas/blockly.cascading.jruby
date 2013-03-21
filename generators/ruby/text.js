/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Ruby for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby.text');

goog.require('Blockly.Ruby');


Blockly.Ruby.text = function() {
  // Text value.
  var code = Blockly.Ruby.quote_(this.getTitleValue('TEXT'));
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.text_join = function() {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  var code;
  if (this.itemCount_ == 0) {
    return ['\'\'', Blockly.Ruby.ORDER_ATOMIC];
  } else if (this.itemCount_ == 1) {
    var argument0 = Blockly.Ruby.valueToCode(this, 'ADD0',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
    code = 'str(' + argument0 + ')';
    return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  } else if (this.itemCount_ == 2) {
    var argument0 = Blockly.Ruby.valueToCode(this, 'ADD0',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.Ruby.valueToCode(this, 'ADD1',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
    var code = 'str(' + argument0 + ') + str(' + argument1 + ')';
    return [code, Blockly.Ruby.ORDER_UNARY_SIGN];
  } else {
    var code = [];
    for (var n = 0; n < this.itemCount_; n++) {
      code[n] = Blockly.Ruby.valueToCode(this, 'ADD' + n,
          Blockly.Ruby.ORDER_NONE) || '\'\'';
    }
    var tempVar = Blockly.Ruby.variableDB_.getDistinctName('temp_value',
        Blockly.Variables.NAME_TYPE);
    code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
        code.join(', ') + ']])';
    return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
};

Blockly.Ruby.text_append = function() {
  // Append to a variable in place.
  var varName = Blockly.Ruby.variableDB_.getName(this.getTitleValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Ruby.valueToCode(this, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return varName + ' = str(' + varName + ') + str(' + argument0 + ')\n';
};

Blockly.Ruby.text_length = function() {
  // String length.
  var argument0 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return ['len(' + argument0 + ')', Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby.text_isEmpty = function() {
  // Is the string null?
  var argument0 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = 'not len(' + argument0 + ')';
  return [code, Blockly.Ruby.ORDER_LOGICAL_NOT];
};

Blockly.Ruby.text_indexOf = function() {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = this.getTitleValue('END') == 'FIRST' ? 'find' : 'rfind';
  var argument0 = Blockly.Ruby.valueToCode(this, 'FIND',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby.text_charAt = function() {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = this.getTitleValue('WHERE') || 'FROM_START';
  var at = Blockly.Ruby.valueToCode(this, 'AT',
      Blockly.Ruby.ORDER_UNARY_SIGN) || '1';
  var text = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (at.match(/^-?\d+$/)) {
        // If the index is a naked number, decrement it right now.
        at = parseInt(at, 10) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at += ' - 1';
      }
      var code = text + '[' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'FROM_END':
      var code = text + '[-' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'RANDOM':
      if (!Blockly.Ruby.definitions_['text_random_letter']) {
        Blockly.Ruby.definitions_['import_random'] = 'import random';
        var functionName = Blockly.Ruby.variableDB_.getDistinctName(
            'text_random_letter', Blockly.Generator.NAME_TYPE);
        Blockly.Ruby.text_charAt.text_random_letter = functionName;
        var func = [];
        func.push('def ' + functionName + '(text):');
        func.push('  x = int(random.random() * len(text))');
        func.push('  return text[x];');
        Blockly.Ruby.definitions_['text_random_letter'] = func.join('\n');
      }
      code = Blockly.Ruby.text_charAt.text_random_letter +
          '(' + text + ')';
      return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Ruby.text_getSubstring = function() {
  // Get substring.
  var text = Blockly.Ruby.valueToCode(this, 'STRING',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var where1 = this.getTitleValue('WHERE1');
  var where2 = this.getTitleValue('WHERE2');
  var at1 = Blockly.Ruby.valueToCode(this, 'AT1',
      Blockly.Ruby.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Ruby.valueToCode(this, 'AT2',
      Blockly.Ruby.ORDER_ADDITIVE) || '1';
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (at1.match(/^-?\d+$/)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 += ' - 1';
    }
  } else if (where1 == 'FROM_END') {
    at1 = '-' + at1;
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = '';
  } else if (where1 == 'FROM_START') {
    at2 = at2;
  } else if (where1 == 'FROM_END') {
    if (at2.match(/^-?\d+$/)) {
      // If the index is a naked number, increment it right now.
      at2 = 1 - parseInt(at2, 10);
    } else {
      // If the index is dynamic, increment it in code.
      at2 = '1 - ' + at2;
    }
    Blockly.Ruby.definitions_['import_sys'] = 'import sys';
    at2 += ' or sys.maxsize';
  }
  var code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby.text_changeCase = function() {
  // Change capitalization.
  var mode = this.getTitleValue('CASE');
  var operator = Blockly.Ruby.text_changeCase.OPERATORS[mode];
  var argument0 = Blockly.Ruby.valueToCode(this, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = argument0 + operator;
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby.text_changeCase.OPERATORS = {
  UPPERCASE: '.upper()',
  LOWERCASE: '.lower()',
  TITLECASE: '.title()'
};

Blockly.Ruby.text_trim = function() {
  // Trim spaces.
  var mode = this.getTitleValue('MODE');
  var operator = Blockly.Ruby.text_trim.OPERATORS[mode];
  var argument0 = Blockly.Ruby.valueToCode(this, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = argument0 + operator;
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby.text_trim.OPERATORS = {
  LEFT: '.lstrip()',
  RIGHT: '.rstrip()',
  BOTH: '.strip()'
};

Blockly.Ruby.text_print = function() {
  // Print statement.
  var argument0 = Blockly.Ruby.valueToCode(this, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ')\n';
};

Blockly.Ruby.text_prompt = function() {
  // Prompt function.
  if (!Blockly.Ruby.definitions_['text_prompt']) {
    var functionName = Blockly.Ruby.variableDB_.getDistinctName(
        'text_prompt', Blockly.Generator.NAME_TYPE);
    Blockly.Ruby.text_prompt.text_prompt = functionName;
    var func = [];
    func.push('def ' + functionName + '(msg):');
    func.push('  try:');
    func.push('    return raw_input(msg)');
    func.push('  except NameError:');
    func.push('    return input(msg)');
    Blockly.Ruby.definitions_['text_prompt'] = func.join('\n');
  }
  var msg = Blockly.Ruby.quote_(this.getTitleValue('TEXT'));
  var code = Blockly.Ruby.text_prompt.text_prompt + '(' + msg + ')';
  var toNumber = this.getTitleValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};
