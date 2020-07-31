<template>
  <ul :class="`${prefixCls}-question-container`">
    <li
      v-for="question in realQuestions"
      :key="question.key"
      :class="`${prefixCls}-item`"
    >
      <p :class="`${prefixCls}-title-container`">
        <template v-if="isComponent(question.title)">
          <component :is="question.title" />
        </template>
        <template v-else>{{ question.title }}</template>
      </p>
      <vant-input
        v-if="question.widgetType === 'input'"
        :value="question.widgetProps.value"
        :class="`${prefixCls}-input`"
        @input="(val) => handleInput(val, question)"
      />
      <van-checkbox-group
        v-if="question.widgetType === 'checkbox'"
        :value="question.value"
        :class="`${prefixCls}-checkbox-group`"
        @input="(val) => handleInput(val, question)"
      >
        <van-checkbox
          v-for="option in question.options"
          :key="option.value"
          :name="option.value"
          shape="square"
        >
          <template v-if="isComponent(option.label)">
            <component :is="option.label" />
          </template>
          <template v-else>{{ option.label }}</template>
        </van-checkbox>
      </van-checkbox-group>
    </li>
</ul>
</template>

<script>
import _ from 'lodash';
import Schema from 'async-validator';
import questions from './questions';

export default {
  name: 'question-render',

  props: {
    /**
     * question 数据类型 Question[]
        interface Question {
            title: string;
            type: 'radio' | 'checkbox' | 'select' | 'input';
            key: string; // 唯一key
            widgetProps: {
                isShowNo: boolean; // 是否显示索引
            };
            options: Options; checkbox select radio 需要的子项
            rules: Rules[]; 校验规则，使用async-validator校验库
            skip: boolean; 是否跳过题目
            index: number; 从0开始
            value: any; 选中值
        }

        interface Options {
            label: string;
            value: string;
        }
        */

    questions: {
      type: Array,
      required: true
    },

    prefixCls: {
      type: String,
      default: 'mec-question'
    },
  
    /**
     * 每当选项值变化会调用该函数，可以通过该函数生成新的问题列表
     */
    onConvert: {
      type: Function,
      default: (val, questions) => questions
    },

    pageNoCursor: {
      type: Number,
      default: 0
    },
  },

  data() {
    return {
        isValidate: false
    };
  },

  watch: {
    questions() {
        try {
            this.handleValidate().catch(() => {});
        } catch (error) {
            // TODO
        }
    }
  },

  methods: {
    handleInput(val, question) {
        const copyQuestions = _.cloneDeep(this.questions);
        copyQuestions[question.index].value = val;
        this.$emit('update:questions', this.onConvert(val, copyQuestions, question));
    },

    handlePrevious() {
      this.$emit('update:pageNoCursor', this.pageNoCursor - 1);
    },

    async handleNext() {
        try {
            await this.handleValidate(true);
            this.$emit('update:pageNoCursor', this.pageNoCursor + 1);
        } catch (error) {
            // TODO
        }
    },

    async handleSubmit() {
        try {
            await this.handleValidate(true);
            this.$emit('submit');
        } catch (error) {
            // TODO
        }
    },

    handleValidate(showTip) {
      const source = this.realQuestions
        .filter(question => !['pager'].includes(question.widgetType))
        .reduce((result, current) => ({
          ...result,
          [current.key]: current.widgetProps.value
        }), {});
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line consistent-return
        this.schema.validate(source, (errors) => {
          if (errors) {
            if (showTip) {
              this.handleShowErrorMessage(errors);
            }
            this.isValidate = false;
            reject();
            return;
          }
          this.isValidate = true;
          resolve();
        });
      });
    },

    handleShowErrorMessage() {
        // TODO 从props传入校验失败处理函数
        this.$toast.isShow('选项是必填的');
    },

    isComponent(component) {
        return _.isObject(component) && _.isFunction(component.render);
    }
  },

  computed: {
    skipLength() {
        let sum = 0;
        for (let i = 0; i < this.pageNoCursor; i += 1) {
            sum += this.pageSizeRules[i];
        }
        return sum;
    },

    realQuestions() {
      return this.questions;
            // .slice(this.skipLength, this.skipLength + this.pageSizeRules[this.pageNoCursor])
            // .filter(({ skip }) => !skip);
    },

    showPrevousButton() {
        return this.pageNoCursor !== 0;
    },

    showNextButton() {
        // 游标超出或者到底
        return this.pageNoCursor < (this.pageSizeRules.length - 1);
    },

    showSubmitButton() {
        return !this.showNextButton;
    },

    schema() {
        const descriptor = this.realQuestions.reduce((result, current) => {
            if (current.rules) {
                return {
                    ...result,
                    [current.key]: current.rules
                };
            }
            return result;
        }, {});
        return new Schema(descriptor);
    },
    
    /**
     * 分页用来做切换不同题目的场景
     */
    pageSizeRules() {
      return [99999]
    },

  },

  async mounted() {
    try {
        await this.handleValidate();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('mounted validate error', error);
    }
  }
};
</script>
