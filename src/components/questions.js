import Pager from './Pager';
import NextPager from './NextPager';
import Submit from './Submit';
import MyTitle from './MyTitle';

export default [
  {
    title: '请问您的姓名?',
    widgetType: 'input',
    widgetProps: {
      value: '',
    },
    key: 'name',
    rules: [{
      type: 'string',
      required: true
    }],
  },
  {
    title: null,
    widgetType: 'pager',
    widget: NextPager,
    key: 'pager1',
  },
  {
    title: MyTitle,
    widgetType: 'radio',
    widgetProps: {
      value: null,
      options: [{
        label: '男',
        value: 1,
        related: ['specialty'],
      }, {
        label: '女',
        value: 2,
        related: ['hoppy'],
      }],
    },
    key: 'sex',
    rules: [{
      type: 'number',
      required: true
    }],
  },
  {
    title: null,
    widgetType: 'pager',
    widget: Pager,
    key: 'pager2',
  },
  {
    title: '你的爱好',
    widgetType: 'checkbox',
    widgetProps: {
      value: null,
      options: [{
        label: '插画',
        value: 1,
      }, {
        label: '画画',
        value: 2,
      }, {
        label: '玩耍',
        value: 3,
      }],
    },
    key: 'hoppy',
    rules: [{
      type: 'number',
      required: true
    }],
  },
  {
    title: '你的特长',
    widgetType: 'checkbox',
    widgetProps: {
      value: null,
      options: [{
        label: '足球',
        value: 1,
      }, {
        label: '篮球',
        value: 2,
      }, {
        label: '以上都是',
        value: 3,
      }],
    },
    key: 'specialty',
    rules: [{
      type: 'number',
      required: true
    }],
  },
  {
    title: null,
    widgetType: 'pager',
    widget: Submit,
    key: 'pager3',
  },
].map((item, index) => ({ ...item, index }));
