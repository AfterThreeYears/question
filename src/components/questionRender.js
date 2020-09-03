import Schema from 'async-validator';
import {
  isComponent,
  getQuestionByPageNoCursor,
  convertValueByMutex,
} from './questionRenderHelper';
import { isNil, cloneDeep, noop } from 'lodash';
import { FORM, ISOLATION } from './questionRenderHelper';

export default {
  name: 'question-render',

  props: {
    questions: {
      type: Array,
      required: true
    },

    prefixCls: {
      type: String,
      default: 'wy-question'
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

  // watch: {
  //   questions() {
  //       try {
  //           this.handleValidate().catch(() => {});
  //       } catch (error) {
  //           // TODO
  //       }
  //   }
  // },

  methods: {
    onNext() {
      this.handleValidate(true)
        .then(() => {
          this.$emit('update:pageNoCursor', this.pageNoCursor + 1);
        })
        .catch(noop);
    },

    onPrev() {
      this.$emit('update:pageNoCursor', this.pageNoCursor - 1);
    },

    onSubmit() {
      this.handleValidate(true)
        .then(() => {
          this.$emit('submit');
        })
        .catch(noop);
    },

    handleInput(value, index) {
      let newValue = value;
      const copyQuestions = cloneDeep(this.questions);
      const copyQuestion = copyQuestions[index];
      if (isNil(copyQuestion.widgetProps)) {
        copyQuestion.widgetProps = {};
      }
      // 互斥逻辑
      const mutex = copyQuestion.config?.mutex;
      if (mutex) {
        const oldValue = copyQuestion.widgetProps.value;
        newValue = convertValueByMutex(mutex, newValue, oldValue);
      }
      copyQuestion.widgetProps.value = newValue;
      this.$emit('update:questions', copyQuestions);
    },

    handleValidate(showTip) {
      const source = this.realQuestions
        .filter(question => question.widgetType === FORM)
        .reduce((result, current) => ({
          ...result,
          [current.key]: current.widgetProps?.value
        }), {});
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line consistent-return
        this.schema.validate(source, (errors) => {
          if (errors) {
            if (showTip) {
              this.$emit('showErrorMessage', errors);
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
  },

  computed: {
    realQuestions() {
      // 根据当前页数来获取真实的问题
      return getQuestionByPageNoCursor(this.questions, this.pageNoCursor)
        .filter(({ key }) => this.relatedQuestionMap[key] !== false);
    },

    isFirstPageNo() {
      return this.pageNoCursor === 0;
    },

    isLastPageNo() {
      return (this.questions.filter(question => question.widgetType === ISOLATION).length - 1) === this.pageNoCursor;
    },

    relatedQuestionMap() {
      return this.questions.reduce((result, current) => {
        const related = current.config?.related;
        if (isNil(related)) {
          return result;
        }
        const widgetValue = current.widgetProps?.value;
        Object.entries(related).forEach(([answer, key]) => {
          result[key] = (answer === widgetValue);
        });
        return result;
      }, {});
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
  },

  async mounted() {
    try {
        await this.handleValidate();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('mounted validate error', error);
    }
  },

  render() {
    const {
      prefixCls,
      realQuestions,
      isFirstPageNo,
      isLastPageNo,
    } = this;
    return <ul class={`${prefixCls}-question-container`}>
      {realQuestions.map((question) => {
        const {
          key,
          title: Title,
          widget: Widget,
          widgetType,
          widgetProps = {},
          className,
          trigger = 'input'
        } = question;
        let propsBinding = {};
        if (widgetType === FORM) {
          propsBinding = {
            props: widgetProps,
            on: {
              [trigger]: (val) => this.handleInput(val, question.index),
            },
          }
        } else if (widgetType === ISOLATION) {
          propsBinding = {
            on: {
              next: this.onNext,
              prev: this.onPrev,
              submit: this.onSubmit,
            },
            props: {
              isFirstPageNo,
              isLastPageNo,
            },
          }
        }
        propsBinding.class = className;
        return <li key={key} class={`${prefixCls}-question-item ${prefixCls}-${key}-question-item`}>
          {!isNil(Title) && <label class={`${prefixCls}-${key}-question-item-label`}>
            { isComponent(Title) ? <Title /> : Title }
          </label>}
          <Widget {...propsBinding} />
        </li>;
      })}
  </ul>
  }
};
