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
 * @fileoverview Generating Ruby for list blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby.lists');

goog.require('Blockly.Ruby');

Blockly.Ruby.lists_create_empty = function() {
  // Create an empty list.
  return ['[]', Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.lists_create_with = function() {
  // Create a list with any number of elements of any type.
  var code = new Array(this.itemCount_);
  for (var n = 0; n < this.itemCount_; n++) {
    code[n] = Blockly.Ruby.valueToCode(this, 'ADD' + n,
        Blockly.Ruby.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby.lists_repeat = function() {
  // Create a list with one element repeated.
  var argument0 = Blockly.Ruby.valueToCode(this, 'ITEM',
      Blockly.Ruby.ORDER_NONE) || 'None';
  var argument1 = Blockly.Ruby.valueToCode(this, 'NUM',
      Blockly.Ruby.ORDER_MULTIPLICATIVE) || '0';
  var code = '[' + argument0 + '] * ' + argument1;
  return [code, Blockly.Ruby.ORDER_MULTIPLICATIVE];
};

Blockly.Ruby.lists_length = function() {
  // List length.
  var argument0 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '[]';
  return ['len(' + argument0 + ')', Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby.lists_isEmpty = function() {
  // Is the list empty?
  var argument0 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '[]';
  var code = 'not len(' + argument0 + ')';
  return [code, Blockly.Ruby.ORDER_LOGICAL_NOT];
};

Blockly.Ruby.lists_indexOf = function() {
  // Find an item in the list.
  var argument0 = Blockly.Ruby.valueToCode(this, 'FIND',
      Blockly.Ruby.ORDER_NONE) || '[]';
  var argument1 = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code;
  if (this.getTitleValue('END') == 'FIRST') {
    if (!Blockly.Ruby.definitions_['first_index']) {
      var functionName = Blockly.Ruby.variableDB_.getDistinctName(
          'first_index', Blockly.Generator.NAME_TYPE);
      Blockly.Ruby.lists_indexOf.first_index = functionName;
      var func = [];
      func.push('def ' + functionName + '(myList, elem):');
      func.push('  try: theIndex = myList.index(elem) + 1');
      func.push('  except: theIndex = 0');
      func.push('  return theIndex');
      Blockly.Ruby.definitions_['first_index'] = func.join('\n');
    }
    code = Blockly.Ruby.lists_indexOf.first_index + '(' +
        argument1 + ', ' + argument0 + ')';
    return [code, Blockly.Ruby.ORDER_MEMBER];
  } else {
    if (!Blockly.Ruby.definitions_['last_index']) {
      var functionName = Blockly.Ruby.variableDB_.getDistinctName(
          'last_index', Blockly.Generator.NAME_TYPE);
      Blockly.Ruby.lists_indexOf.last_index = functionName;
      var func = [];
      func.push('def ' + functionName + '(myList, elem):');
      func.push('  try: theIndex = len(myList) - myList[::-1].index(elem)');
      func.push('  except: theIndex = 0');
      func.push('  return theIndex');
      Blockly.Ruby.definitions_['last_index'] = func.join('\n');
    }
    code = Blockly.Ruby.lists_indexOf.last_index + '(' +
        argument1 + ', ' + argument0 + ')';
    return [code, Blockly.Ruby.ORDER_MEMBER];
  }
};

Blockly.Ruby.lists_getIndex = function() {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = this.getTitleValue('MODE') || 'GET';
  var where = this.getTitleValue('WHERE') || 'FROM_START';
  var at = Blockly.Ruby.valueToCode(this, 'AT',
      Blockly.Ruby.ORDER_UNARY_SIGN) || '1';
  var list = Blockly.Ruby.valueToCode(this, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '[0]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    } else {
      var code = list + '.pop(0)';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '[-1]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    } else {
      var code = list + '.pop()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (at.match(/^-?\d+$/)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    } else {
      var code = list + '.pop(' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list + '[-' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    } else {
      var code = list + '.pop(-' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'RANDOM') {
    Blockly.Ruby.definitions_['import_random'] = 'import random';
    if (mode == 'GET') {
      code = 'random.choice(' + list + ')';
      return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
    } else {
      if (!Blockly.Ruby.definitions_['lists_remove_random_item']) {
        var functionName = Blockly.Ruby.variableDB_.getDistinctName(
            'lists_remove_random_item', Blockly.Generator.NAME_TYPE);
        Blockly.Ruby.lists_getIndex.random = functionName;
        var func = [];
        func.push('def ' + functionName + '(myList):');
        func.push('  x = int(random.random() * len(myList))');
        func.push('  return myList.pop(x)');
        Blockly.Ruby.definitions_['lists_remove_random_item'] = func.join('\n');
      }
      code = Blockly.Ruby.lists_getIndex.random + '(' + list + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Ruby.lists_setIndex = function() {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Ruby.valueToCode(this, 'LIST',
      Blockly.Ruby.ORDER_MEMBER) || '[]';
  var mode = this.getTitleValue('MODE') || 'GET';
  var where = this.getTitleValue('WHERE') || 'FROM_START';
  var at = Blockly.Ruby.valueToCode(this, 'AT',
      Blockly.Ruby.ORDER_NONE) || '1';
  var value = Blockly.Ruby.valueToCode(this, 'TO',
      Blockly.Ruby.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Ruby.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }
  if (where == 'FIRST') {
    if (mode == 'SET') {
      return list + '[0] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(0, ' + value + ')\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      return list + '[-1] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.append(' + value + ')\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (at.match(/^-?\d+$/)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(' + at + ', ' + value + ')\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'SET') {
      return list + '[-' + at + '] = ' + value + '\n';
    } else if (mode == 'INSERT') {
      return list + '.insert(-' + at + ', ' + value + ')\n';
    }
  } else if (where == 'RANDOM') {
    Blockly.Ruby.definitions_['import_random'] = 'import random';
    var code = cacheList();
    var xVar = Blockly.Ruby.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += xVar + ' = int(random.random() * len(' + list + '))\n';
    if (mode == 'SET') {
      code += list + '[' + xVar + '] = ' + value + '\n';
      return code;
    } else if (mode == 'INSERT') {
      code += list + '.insert(' + xVar + ', ' + value + ')\n';
      return code;
    }
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.Ruby.lists_getSublist = function() {
  // Get sublist.
  var list = Blockly.Ruby.valueToCode(this, 'LIST',
      Blockly.Ruby.ORDER_MEMBER) || '[]';
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
  var code = list + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Ruby.ORDER_MEMBER];
};
