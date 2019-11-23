(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.TreeView = factory());
}(this, (function () { 'use strict';

  /**
   * Custom view API.
   */
  class LiveView {
    constructor (options) {
      this.options = options;
      this.fails = [];
    }

    log (...args) {
      const ansi = require('ansi-escape-sequences');
      if (this.prevLineCount) {
        process.stdout.write(ansi.cursor.previousLine(this.prevLineCount));
      }
      console.log(ansi.format(args.join(' ')));
    }

    /**
     * Runner start.
     * @param {number}
     */
    start (count) {
    }

    /**
     * Test start
     * @param {Tom}
     */
    testStart (test) {
      this.printTree();
    }

    /**
     * Test passed.
     * @param {Tom}
     * @param {*}
     */
    testPass (test, result) {
      this.printTree();
    }

    /**
     * Test passed.
     * @param {Tom}
     * @param {*}
     */
    testFail (test, err) {
      this.printTree();
      this.fails.push(test);
    }

    /**
     * Test skipped.
     * @param {Tom}
     */
    testSkip (test) {
      this.printTree();
    }

    /**
     * @params {object} stats
     * @params {object} stats.fail
     * @params {object} stats.pass
     * @params {object} stats.skip
     * @params {object} stats.start
     * @params {object} stats.end
     */
    end (stats) {
      this.prevLineCount = 0;
      const failColour = stats.fail > 0 ? 'red' : 'white';
      const passColour = stats.pass > 0 ? 'green' : 'white';
      const skipColour = stats.skip > 0 ? 'grey' : 'white';
      this.log(`\n[white]{Completed in ${stats.timeElapsed()}ms. Pass: [${passColour}]{${stats.pass}}, fail: [${failColour}]{${stats.fail}}, skip: [${skipColour}]{${stats.skip}}.}\n`);

      const fails = [];
      for (const test of this.fails) {
        const err = test.result;
        const indent = ' '.repeat(test.level());
        const parent = test.parent ? test.parent.name : '';
        fails.push(`${indent}[red]{⨯} [magenta]{${parent}} ${test.name}`);
        const lines = err.stack.split('\n').map(line => {
          const indent = ' '.repeat(test.level() + 2);
          return indent + line
        });
        fails.push(`\n${lines.join('\n').trimEnd()}\n`);
      }
      if (fails.length) {
        this.log(fails.join('\n'));
      }
    }

    printTree () {
      const ansi = require('ansi-escape-sequences');
      const groups = Array.from(this.runner.tom).filter(t => t.state === 'ignored');
      /* tmp fix while root node remains in 'pending' state (should be ignored) */
      groups.unshift(this.runner.tom);
      const lines = [];
      for (const group of groups) {
        const line = [ansi.erase.inLine(2)];
        const indent = ' '.repeat(group.level());
        line.push(`${indent}- [magenta]{${group.name}} `);
        for (const test of group.children) {
          if (test.state === 'pass') {
            line.push('[green]{✓}');
          } else if (test.state === 'fail') {
            line.push('[red]{⨯}');
          } else if (test.state === 'in-progress') {
            line.push('[cyan]{•}');
          } else if (test.state === 'skipped') {
            line.push('[grey]{•}');
          } else if (test.state === 'pending') {
            line.push('[white]{•}');
          }
        }
        lines.push(line.join(''));
      }
      this.log(lines.join('\n'));
      this.prevLineCount = lines.length;
    }

    /**
     * Option definitions.
     * @returns {OptionDefinition[]}
     */
    static optionDefinitions () {}
  }

  return LiveView;

})));
