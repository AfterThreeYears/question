import Schema from 'async-validator';
import { isNil, cloneDeep, noop } from 'lodash';
import {
    isComponent,
    getQuestionByPageNoCursor,
    convertValueByMutex,
    FORM,
    ISOLATION,
    PRESENTATIONAL,
    opActionMap,
    separatePropsAndAttrs,
    convert2Map,
} from './questionRenderHelper';

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
        }
    },

    data() {
        return {
            isValidate: false,
            direction: 'onNext',
            errorMap: {},
        };
    },

    watch: {
        realQuestions(newVal) {
            if (newVal.filter(val => val.widgetType !== ISOLATION).length === 0) {
                this[this.direction]();
            }
        }
    },

    methods: {
        onNext() {
            this.direction = 'onNext';
            this.handleValidate(true)
                .then(() => {
                    this.$emit('update:pageNoCursor', this.pageNoCursor + 1);
                })
                .catch(noop);
        },

        onPrev() {
            this.direction = 'onPrev';
            this.$emit('update:pageNoCursor', this.pageNoCursor - 1);
        },

        onSubmit() {
            this.handleValidate(true)
                .then(() => {
                    const formQuestions = this.questions
                        .filter(question => question.widgetType === FORM)
                        .map((question) => {
                            const needClearValue = this.relatedQuestionMap[question.key] === false;
                            return {
                                ...question,
                                widgetProps: {
                                    ...question.widgetProps,
                                    value: needClearValue ? undefined : question.widgetProps.value
                                }
                            };
                        });
                    this.$emit('submit', formQuestions, this.questions);
                })
                .catch(noop);
        },

        handleInput(value, question) {
            const { index, config = {} } = question;
            let newValue = value;
            const copyQuestions = cloneDeep(this.questions);
            const copyQuestion = copyQuestions[index];
            if (isNil(copyQuestion.widgetProps)) {
                copyQuestion.widgetProps = {};
            }
            // 互斥逻辑
            const mutex = copyQuestion.config && copyQuestion.config.mutex;
            if (mutex) {
                const oldValue = copyQuestion.widgetProps.value;
                newValue = convertValueByMutex(mutex, newValue, oldValue);
            }
            copyQuestion.widgetProps.value = newValue;
            this.$emit('update:questions', copyQuestions);
            // hack
            this.$nextTick(() => {
                if (config.autoSubmit) {
                    this.onSubmit();
                    return;
                }
                if (config.autoNext) {
                    this.onNext();
                }
            });
        },

        handleValidate(showTip) {
            const source = this.realQuestions
                .filter(question => question.widgetType === FORM)
                .reduce((result, current) => ({
                    ...result,
                    [current.key]: current.widgetProps && current.widgetProps.value
                }), {});
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line consistent-return
                this.schema.validate(source, (errors) => {
                    this.$set(this, 'errorMap', convert2Map(errors, 'field'));
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

        getPropsBinding(question) {
            const {
                widgetType,
                widgetProps = {},
                className,
                trigger = 'input',
                widget
            } = question;
            const { isFirstPageNo, isLastPageNo, questions } = this;
            const propsBindingMap = {
                [FORM]: {
                    class: className,
                    ...separatePropsAndAttrs(widget.props, widgetProps),
                    on: {
                        [trigger]: val => this.handleInput(val, question)
                    }
                },
                [ISOLATION]: {
                    class: className,
                    on: {
                        next: this.onNext,
                        prev: this.onPrev,
                        submit: this.onSubmit
                    },
                    props: {
                        isFirstPageNo,
                        isLastPageNo
                    }
                },
                [PRESENTATIONAL]: {
                    class: className,
                    props: {
                        questions
                    }
                }
            };
            return propsBindingMap[widgetType] || {};
        },

        getTitlePropsBinding(question) {
            const index = this.questions.findIndex(({ key }) => key === question.key);
            // eslint-disable-next-line no-bitwise
            if (!~index) return {};
            const no = this.questions.slice(0, index)
                .filter(({ widgetType }) => widgetType === FORM)
                .filter(({ key }) => this.relatedQuestionMap[key] !== false)
                .length;
            return {
                props: {
                    no
                }
            };
        },

        formItemClass(key) {
          const { prefixCls, errorMap } = this;
          return {
            [`${prefixCls}-question-item`]: true,
            [`${prefixCls}-${key}-question-item`]: true,
            [`${prefixCls}-question-item-invalidate`]: errorMap[key],
          };
        }
    },

    computed: {
        hasIsolationcComponent() {
            // eslint-disable-next-line max-len
            return Boolean(this.questions.filter(question => question.widgetType === ISOLATION).length);
        },

        realQuestions() {
            // 根据当前页数来获取真实的问题
            // eslint-disable-next-line max-len
            const questions = this.hasIsolationcComponent ? getQuestionByPageNoCursor(this.questions, this.pageNoCursor) : this.questions;
            return questions.filter(({ key }) => this.relatedQuestionMap[key] !== false);
        },

        isFirstPageNo() {
            return this.pageNoCursor === 0;
        },

        isLastPageNo() {
            // eslint-disable-next-line max-len
            return (this.questions.filter(question => question.widgetType === ISOLATION).length - 1) === this.pageNoCursor;
        },

        relatedQuestionMap() {
            return this.questions.reduce((result, current) => {
                const related = current.config && current.config.related;
                if (isNil(related)) {
                    return result;
                }
                const widgetValue = current.widgetProps && current.widgetProps.value;
                Object.entries(related).forEach(([key, { answer, op }]) => {
                    const preState = result[key] !== false;
                    // eslint-disable-next-line no-param-reassign
                    result[key] = opActionMap[op](answer, widgetValue) && preState;
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
        }
    },

    render() {
        const { prefixCls, realQuestions } = this;
        return <ul class={`${prefixCls}-question-container`}>
            {realQuestions.map((question) => {
                const {
                    key,
                    title: Title,
                    // eslint-disable-next-line no-unused-vars
                    widget: Widget
                } = question;
                const widgetPropsBinding = this.getPropsBinding(question);
                const titlePropsBinding = this.getTitlePropsBinding(question);
                return <li key={key} class={this.formItemClass(key)}>
                    {!isNil(Title) && <label class={`${prefixCls}-${key}-question-item-label ${prefixCls}-question-item-label`}>
                        { isComponent(Title) ?
                            <Title {...titlePropsBinding} />
                            : Title }
                    </label>}
                    <Widget {...widgetPropsBinding} />
                </li>;
            })}
        </ul>;
    }
};
