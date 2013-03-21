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
 * @fileoverview Helper functions for generating Ruby for blocks.
 * @author steve@10xengineer.me (Steve Messina)
 */
'use strict';

goog.provide('Blockly.Ruby');

goog.require('Blockly.CodeGenerator');

Blockly.Ruby = Blockly.Generator.get('Ruby');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Ruby.addReservedWords(
    // http://www.java2s.com/Code/Ruby/Language-Basics/Rubysreservedwords.htm
    'BEGIN,END,alias,and,begin,break,case,class,def,defined?,do,else,elsif,end,ensure,false,for,if,module,next,nil,not,or,redo,rescue,retry,return,self,super,then,true,undef,unless,until,when,while,yield,' +
    'nil,true,false,__FILE__,__LINE__,' +
	// http://www.tutorialspoint.com/ruby/ruby_builtin_functions.htm
    'abort,Array,at_exit,autoload,binding,block_given?,callcc,caller,catch,chomp,chomp!,chop,chop!,eval,exec,exit,exit!,fail,Float,fork,format,gets,global_variables,gsub,gsub!,integer,lambda,proc,load,local_variables,loop,open,p,print,printf,putc,puts,raise,rand,readline,readlines,scan,select,set_trace_func,sleep,split,sprintf,format,srand,String,syscall,system,sub,sub!,test,throw,trace_var,trap,untrace_var');

/**
 * Order of operation ENUMs.
 * 
 */
Blockly.Ruby.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Ruby.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.Ruby.ORDER_STRING_CONVERSION = 1; // `expression...`
Blockly.Ruby.ORDER_MEMBER = 2;            // . []
Blockly.Ruby.ORDER_FUNCTION_CALL = 2;     // ()
Blockly.Ruby.ORDER_EXPONENTIATION = 3;    // **
Blockly.Ruby.ORDER_UNARY_SIGN = 4;        // + -
Blockly.Ruby.ORDER_BITWISE_NOT = 4;       // ~
Blockly.Ruby.ORDER_MULTIPLICATIVE = 5;    // * / // %
Blockly.Ruby.ORDER_ADDITIVE = 6;          // + -
Blockly.Ruby.ORDER_BITWISE_SHIFT = 7;     // << >>
Blockly.Ruby.ORDER_BITWISE_AND = 8;       // &
Blockly.Ruby.ORDER_BITWISE_XOR = 9;       // ^
Blockly.Ruby.ORDER_BITWISE_OR = 10;       // |
Blockly.Ruby.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                            //     <, <=, >, >=, <>, !=, ==
Blockly.Ruby.ORDER_LOGICAL_NOT = 12;      // not
Blockly.Ruby.ORDER_LOGICAL_AND = 13;      // and
Blockly.Ruby.ORDER_LOGICAL_OR = 14;       // or
Blockly.Ruby.ORDER_CONDITIONAL = 15;      // if else
Blockly.Ruby.ORDER_LAMBDA = 16;           // lambda
Blockly.Ruby.ORDER_NONE = 99;             // (...)

/**
 * Arbitrary code to inject into locations that risk causing infinite loops.
 * Any instances of '%1' will be replaced by the block ID that failed.
 * E.g. '  checkTimeout(%1)\n'
 * @type ?string
 */
Blockly.Ruby.INFINITE_LOOP_TRAP = null;

/**
 * Initialise the database of variable names.
 */
Blockly.Ruby.init = function() {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Ruby.definitions_ = {};

  if (Blockly.Variables) {
    if (!Blockly.Ruby.variableDB_) {
      Blockly.Ruby.variableDB_ =
          new Blockly.Names(Blockly.Ruby.RESERVED_WORDS_);
    } else {
      Blockly.Ruby.variableDB_.reset();
    }

    var defvars = [];
    var variables = Blockly.Variables.allVariables();
    for (var x = 0; x < variables.length; x++) {
      defvars[x] = Blockly.Ruby.variableDB_.getName(variables[x],
          Blockly.Variables.NAME_TYPE) + ' = None';
    }
    Blockly.Ruby.definitions_['variables'] = defvars.join('\n');
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Ruby.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Ruby.definitions_) {
    var def = Blockly.Ruby.definitions_[name];
    if (def.match(/^require\s+\S+/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Ruby.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Ruby string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Ruby string.
 * @private
 */
Blockly.Ruby.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\%/g, '\\%')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Ruby from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Ruby code created for this block.
 * @return {string} Ruby code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Blockly.Ruby.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Generator.prefixLines(comment, '# ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Generator.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
