export default {
  name: 'next-pager',

  props: {
    isFirstPageNo: {
      type: Boolean,
      required: true,
    },
    isLastPageNo: {
      type: Boolean,
      required: true,
    }
  },

  methods: {
    handleNext() {
      this.$emit('next');
    },
    handlePrev() {
      this.$emit('prev');
    },
    handleSubmit() {
      this.$emit('submit');
    },
  },

  render() {
    return <div>
      {!this.isFirstPageNo && <button onClick={this.handlePrev}>上一页</button>}
      {!this.isLastPageNo && <button onClick={this.handleNext}>下一页</button>}
      {this.isLastPageNo && <button onClick={this.handleSubmit}>提交</button>}
    </div>
  },
};
