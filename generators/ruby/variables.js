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
 * @fileoverview Generating Ruby for variable blocks.
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby.variables');

goog.require('Blockly.Ruby');

Blockly.Ruby.variables_get = function() {
  // Variable getter.
  var code = Blockly.Ruby.variableDB_.getName(this.getTitleValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.variables_set = function() {
  // Variable setter.
  var argument0 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '0';
  var varName = Blockly.Ruby.variableDB_.getName(this.getTitleValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + argument0 + '\n';
};
