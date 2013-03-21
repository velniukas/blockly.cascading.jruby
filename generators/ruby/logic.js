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
 * @fileoverview Generating Ruby for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby.logic');

goog.require('Blockly.Ruby');

Blockly.Ruby.logic_compare = function() {
  // Comparison operator.
  var mode = this.getTitleValue('OP');
  var operator = Blockly.Ruby.logic_compare.OPERATORS[mode];
  var order = Blockly.Ruby.ORDER_RELATIONAL;
  var argument0 = Blockly.Ruby.valueToCode(this, 'A', order) || '0';
  var argument1 = Blockly.Ruby.valueToCode(this, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Ruby.logic_compare.OPERATORS = {
  EQ: '==',
  NEQ: '!=',
  LT: '<',
  LTE: '<=',
  GT: '>',
  GTE: '>='
};

Blockly.Ruby.logic_operation = function() {
  // Operations 'and', 'or'.
  var operator = (this.getTitleValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Ruby.ORDER_LOGICAL_AND :
      Blockly.Ruby.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Ruby.valueToCode(this, 'A', order) || 'False';
  var argument1 = Blockly.Ruby.valueToCode(this, 'B', order) || 'False';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Ruby.logic_negate = function() {
  // Negation.
  var argument0 = Blockly.Ruby.valueToCode(this, 'BOOL',
      Blockly.Ruby.ORDER_LOGICAL_NOT) || 'False';
  var code = 'not ' + argument0;
  return [code, Blockly.Ruby.ORDER_LOGICAL_NOT];
};

Blockly.Ruby.logic_boolean = function() {
  // Boolean values true and false.
  var code = (this.getTitleValue('BOOL') == 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.logic_null = function() {
  // Null data type.
  return ['None', Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.logic_ternary = function() {
  // Ternary operator.
  var value_if = Blockly.Ruby.valueToCode(this, 'IF',
      Blockly.Ruby.ORDER_CONDITIONAL) || 'False';
  var value_then = Blockly.Ruby.valueToCode(this, 'THEN',
      Blockly.Ruby.ORDER_CONDITIONAL) || 'None';
  var value_else = Blockly.Ruby.valueToCode(this, 'ELSE',
      Blockly.Ruby.ORDER_CONDITIONAL) || 'None';
  var code = value_then + ' if ' + value_if + ' else ' + value_else
  return [code, Blockly.Ruby.ORDER_CONDITIONAL];
};
