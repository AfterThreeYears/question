import { RadioGroup, Radio } from 'vant';

export default {
  name: 'custom-radio',

  props: {
    options: {
      type: Array,
      required: true,
    },
    
    value: {
      type: [String, Number],
      required: true,
    }
  },

  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    }
  },

  render() {
    return <RadioGroup value={internalValue}>
    <Radio
      v-for="option in options"
      :name="option.value"
      :key="option"
    >
      {{ option.label }}
    </Radio>
  </RadioGroup>
  }
};