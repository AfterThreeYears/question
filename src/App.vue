<template>
  <div id="app">
    <question-render
      :prefix-cls="prefixCls"
      :questions="questions"
      :page-no-cursor="pageNoCursor"
    />
  </div>
</template>

<script>
import questionRender from './components/questionRender'
import questions from './components/questions';

export default {
  name: 'app',
  data() {
    return {
      questions,
      prefixCls: 'mec',
      pageNoCursor: 0,
    };
  },
  components: {
    questionRender
  }
}
</script>
