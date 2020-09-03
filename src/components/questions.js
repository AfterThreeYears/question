import { Field, Picker } from 'vant';
import NextPager from './NextPager';
import MyTitle from './MyTitle';
import { FORM, ISOLATION } from './questionRenderHelper';
import UIRadio from './UIRadio.vue';
import UICheckbox from './UICheckbox.vue';

export default [
  {
    title: '请问您的姓名?',
    key: 'name',
    widgetType: FORM,
    widget: Field,
    rules: [{
      type: 'string',
      required: true
    }],
  },
  {
    title: '您的地址?',
    key: 'address',
    widgetType: FORM,
    widget: Picker,
    widgetProps: {
      columns: ['杭州', '宁波', '温州', '绍兴', '湖州', '嘉兴', '金华', '衢州'],
      showToolbar: true,
      title: "标题"
    },
    rules: [{
      type: 'string',
      required: true
    }],
    trigger: 'confirm',
  },
  {
    widgetType: ISOLATION,
    widget: NextPager,
    key: 'pager1',
  },
  {
    title: MyTitle,
    key: 'age',
    widgetType: FORM,
    widget: UIRadio,
    widgetProps: {
      options: [
        {
          value: 'nan',
          label: '男'
        },
        {
          value: 'nv',
          label: '女'
        }
      ],
    },
    config: {
      related: {
        nan: 'hobby',
        nv: 'skill'
      }
    },
    rules: [{
      type: 'string',
      required: true
    }],
  },
  {
    widgetType: ISOLATION,
    widget: NextPager,
    key: 'pager2',
  },
  {
    title: '请问您的爱好（男生）?',
    key: 'hobby',
    widgetType: FORM,
    widget: UICheckbox,
    widgetProps: {
      options: [
        {
          value: 'lanqiu',
          label: '洗衣'
        },
        {
          value: 'zuqiu',
          label: '捏脚'
        },
        {
          value: 'doushi',
          label: '以上都是'
        }
      ],
    },
    config: {
      mutex: {
        lanqiu: 1,
        doushi: 2,
        zuqiu: 1,
      },
    },
    rules: [{
      type: 'string',
      required: true
    }],
  },
  {
    title: '请问您的擅长（女生）?',
    key: 'skill',
    widgetType: FORM,
    widget: UICheckbox,
    widgetProps: {
      options: [
        {
          value: 'xiyi',
          label: '吃饭'
        },
        {
          value: 'zuofan',
          label: '躺着'
        },
        {
          value: 'xiyifu',
          label: '买盘子'
        }
      ],
    },
    rules: [{
      type: 'array',
      required: true,
      message: '请选择擅长'
    }],
  },
  {
    widgetType: ISOLATION,
    widget: NextPager,
    key: 'pager3',
  },
].map((item, index) => ({ ...item, index }));
