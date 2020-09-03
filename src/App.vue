<template>
  <div id="app">
    <question-render
      :prefix-cls="prefixCls"
      :questions.sync="questions"
      :page-no-cursor.sync="pageNoCursor"
      @showErrorMessage="showErrorMessage"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { Toast } from 'vant';
import questionRender from './components/questionRender'
import questions from './components/questions';

export default {
  name: 'app',
  data() {
    return {
      questions,
      prefixCls: 'prefix',
      pageNoCursor: 0,
    };
  },
  components: {
    questionRender
  },

  methods: {
    handleSubmit() {
      // eslint-disable-next-line no-console
      console.log('call submit');
    },

    showErrorMessage(errors) {
      Toast(errors[0]?.message)
    }
  }
}
</script>
