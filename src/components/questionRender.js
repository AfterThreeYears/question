// import _ from 'lodash';
// import Schema from 'async-validator';
import { isComponent, getQuestionByPageNoCursor } from './questionRenderHelper';
import { isNil } from 'lodash';
import { FORM, ISOLATION } from './questionRenderHelper';

export default {
  name: 'question-render',

  props: {
    /**
     * question 数据类型 Question[]
        interface Question {
            title: string;
            type: 'radio' | 'checkbox' | 'select' | 'input';
            key: string; // 唯一key
            propsContainer: {
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
      default: 'wy-question'
    },
  
    /**
     * 每当选项值变化会调用该函数，可以通过该函数生成新的问题列表
     */
    // onConvert: {
    //   type: Function,
    //   default: (val, questions) => questions
    // },

    pageNoCursor: {
      type: Number,
      default: 0
    },
  },

  // data() {
  //   return {
  //       isValidate: false
  //   };
  // },

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
      this.$emit('update:pageNoCursor', this.pageNoCursor + 1);
    },

    onPrev() {
      this.$emit('update:pageNoCursor', this.pageNoCursor - 1);
    },

    onSubmit() {},

    handleInput() {
    // const copyQuestions = _.cloneDeep(this.questions);
    // copyQuestions[question.index].value = val;
    // this.$emit('update:questions', this.onConvert(val, copyQuestions, question));
      console.log(arguments);
    },
  },

  // methods: {
  //   handleInput(val, question) {
  //       const copyQuestions = _.cloneDeep(this.questions);
  //       copyQuestions[question.index].value = val;
  //       this.$emit('update:questions', this.onConvert(val, copyQuestions, question));
  //   },

  //   handlePrevious() {
  //     this.$emit('update:pageNoCursor', this.pageNoCursor - 1);
  //   },

  //   async handleNext() {
  //       try {
  //           await this.handleValidate(true);
  //           this.$emit('update:pageNoCursor', this.pageNoCursor + 1);
  //       } catch (error) {
  //           // TODO
  //       }
  //   },

  //   async handleSubmit() {
  //       try {
  //           await this.handleValidate(true);
  //           this.$emit('submit');
  //       } catch (error) {
  //           // TODO
  //       }
  //   },

  //   handleValidate(showTip) {
  //     const source = this.realQuestions
  //       .filter(question => !['pager'].includes(question.widgetType))
  //       .reduce((result, current) => ({
  //         ...result,
  //         [current.key]: current.propsContainer.value
  //       }), {});
  //     return new Promise((resolve, reject) => {
  //       // eslint-disable-next-line consistent-return
  //       this.schema.validate(source, (errors) => {
  //         if (errors) {
  //           if (showTip) {
  //             this.handleShowErrorMessage(errors);
  //           }
  //           this.isValidate = false;
  //           reject();
  //           return;
  //         }
  //         this.isValidate = true;
  //         resolve();
  //       });
  //     });
  //   },

  //   handleShowErrorMessage() {
  //       // TODO 从props传入校验失败处理函数
  //       this.$toast.isShow('选项是必填的');
  //   },

  computed: {
  //   skipLength() {
  //       let sum = 0;
  //       for (let i = 0; i < this.pageNoCursor; i += 1) {
  //           sum += this.pageSizeRules[i];
  //       }
  //       return sum;
  //   },

    realQuestions() {
      // 根据当前页数来获取真实的问题
      return getQuestionByPageNoCursor(this.questions, this.pageNoCursor);
            // .slice(this.skipLength, this.skipLength + this.pageSizeRules[this.pageNoCursor])
            // .filter(({ skip }) => !skip);
    },

    isFirstPageNo() {
      return this.pageNoCursor === 0;
    },

    isLastPageNo() {
      return (this.questions.filter(question => question.widgetType === ISOLATION).length - 1) === this.pageNoCursor;
    },

  //   showPrevousButton() {
  //       return this.pageNoCursor !== 0;
  //   },

  //   showNextButton() {
  //       // 游标超出或者到底
  //       return this.pageNoCursor < (this.pageSizeRules.length - 1);
  //   },

  //   showSubmitButton() {
  //       return !this.showNextButton;
  //   },

  //   schema() {
  //       const descriptor = this.realQuestions.reduce((result, current) => {
  //           if (current.rules) {
  //               return {
  //                   ...result,
  //                   [current.key]: current.rules
  //               };
  //           }
  //           return result;
  //       }, {});
  //       return new Schema(descriptor);
  //   },
    
  //   /**
  //    * 分页用来做切换不同题目的场景
  //    */
  //   pageSizeRules() {
  //     return [99999]
  //   },

  },

  // async mounted() {
  //   try {
  //       await this.handleValidate();
  //   } catch (error) {
  //       // eslint-disable-next-line no-console
  //       console.error('mounted validate error', error);
  //   }
  // },

  render() {
    const {
      prefixCls,
      realQuestions,
      isFirstPageNo,
      isLastPageNo,
    } = this;
    return <ul class={`${prefixCls}-question-container`}>
      {realQuestions.map(question => {
        const {
          key,
          title: Title,
          widget: Widget,
          widgetType,
          propsContainer = {},
        } = question;
        let props = {};
        if (widgetType === FORM) {
          props = {
            ...propsContainer,
            on: {
              input: this.handleInput
            }
          }
        } else if (widgetType === ISOLATION) {
          props = {
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
        return <li key={key}>
          {!isNil(Title) && <label>
            { isComponent(Title) ? <Title /> : Title }
          </label>}
          <Widget {...props} />
        </li>;
      })}
  </ul>
  }
};
