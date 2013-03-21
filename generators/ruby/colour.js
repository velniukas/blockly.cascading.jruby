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
 * @fileoverview Generating Ruby for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby.colour');

goog.require('Blockly.Ruby');

Blockly.Ruby.colour_picker = function() {
  // Colour picker.
  var code = '\'' + this.getTitleValue('COLOUR') + '\'';
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.colour_rgb = function() {
  // Compose a colour from RGB components.
  if (!Blockly.Ruby.definitions_['colour_rgb']) {
    var functionName = Blockly.Ruby.variableDB_.getDistinctName('colour_rgb',
        Blockly.Generator.NAME_TYPE);
    Blockly.Ruby.colour_rgb.functionName = functionName;
    var func = [];
    func.push('def ' + functionName + '(r, g, b):');
    func.push('  r = round(min(1, max(0, r)) * 255)');
    func.push('  g = round(min(1, max(0, g)) * 255)');
    func.push('  b = round(min(1, max(0, b)) * 255)');
    func.push('  return \'#%02x%02x%02x\' % (r, g, b)');
    Blockly.Ruby.definitions_['colour_rgb'] = func.join('\n');
  }
  var r = Blockly.Ruby.valueToCode(this, 'RED',
                                     Blockly.Ruby.ORDER_NONE) || 0;
  var g = Blockly.Ruby.valueToCode(this, 'GREEN',
                                     Blockly.Ruby.ORDER_NONE) || 0;
  var b = Blockly.Ruby.valueToCode(this, 'BLUE',
                                     Blockly.Ruby.ORDER_NONE) || 0;
  var code = Blockly.Ruby.colour_rgb.functionName +
      '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby.colour_blend = function() {
  // Blend two colours together.
  if (!Blockly.Ruby.definitions_['colour_blend']) {
    var functionName = Blockly.Ruby.variableDB_.getDistinctName('colour_blend',
        Blockly.Generator.NAME_TYPE);
    Blockly.Ruby.colour_blend.functionName = functionName;
    var func = [];
    func.push('def ' + functionName + '(colour1, colour2, ratio):');
    func.push('  r1, r2 = int(colour1[1:3], 16), int(colour2[1:3], 16)');
    func.push('  g1, g2 = int(colour1[3:5], 16), int(colour2[3:5], 16)');
    func.push('  b1, b2 = int(colour1[5:7], 16), int(colour2[5:7], 16)');
    func.push('  ratio = min(1, max(0, ratio))');
    func.push('  r = round(r1 * (1 - ratio) + r2 * ratio)');
    func.push('  g = round(g1 * (1 - ratio) + g2 * ratio)');
    func.push('  b = round(b1 * (1 - ratio) + b2 * ratio)');
    func.push('  return \'#%02x%02x%02x\' % (r, g, b)');
    Blockly.Ruby.definitions_['colour_blend'] = func.join('\n');
  }
  var colour1 = Blockly.Ruby.valueToCode(this, 'COLOUR1',
      Blockly.Ruby.ORDER_NONE) || '\'#000000\'';
  var colour2 = Blockly.Ruby.valueToCode(this, 'COLOUR2',
      Blockly.Ruby.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Ruby.valueToCode(this, 'RATIO',
      Blockly.Ruby.ORDER_NONE) || 0;
  var code = Blockly.Ruby.colour_blend.functionName +
      '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};
