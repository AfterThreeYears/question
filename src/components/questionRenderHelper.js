/* eslint-disable no-plusplus */
import _, { difference, isNil, compact } from 'lodash';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export function isComponent(component) {
    return _.isObject(component) && _.isFunction(component.render);
}

// 隔离组件
export const ISOLATION = 'ISOLATION';
// 表单组件
export const FORM = 'FORM';
// 展示组件
export const PRESENTATIONAL = 'PRESENTATIONAL';

// 等于
export const EQUAL = 'EQUAL';
// 范围
export const RANGE = 'RANGE';

/**
 * 根据当前分页的游标获取分页之间的问题列表
 * @param {*} questions
 * @param {*} pageNoCursor
 */
export function getQuestionByPageNoCursor(questions, pageNoCursor) {
    let i = 0;
    let j = 0;
    let prevPageNoCursor = 0;
    while (i < questions.length) {
        const question = questions[i];
        if (question.widgetType === ISOLATION) {
            if (pageNoCursor === prevPageNoCursor++) {
                return questions.slice(j, i + 1);
            }
            j = i + 1;
        }
        i++;
    }
    return [];
}

/**
 * 根据互斥规则，返回新的value
 * @param {*} mutex
 * @param {*} newValue
 * @param {*} oldValue
 */
export function convertValueByMutex(mutex, newValue, oldValue) {
    const diffValue = difference(newValue, oldValue)[0];
    return newValue.filter(value => mutex[value] === mutex[diffValue]);
}

const relativeTimeRegExp = /^(?<op>[-+])(?<measure>\d+)(?<unit>[a-zA-Z]+)$/;
const absoluteTimeRegExp = /^\d{4}-\d{1,2}-\d{1,2}$/;
const opMap = {
    '-': 'subtract',
    '+': 'add'
};

function formatTimeToString(currentTime, relativeTime) {
    if (isNil(currentTime)) return dayjs().format('YYYY-MM-DD');
    const isAbsolute = absoluteTimeRegExp.test(currentTime);
    if (isAbsolute) {
        return currentTime;
    }
    const timeFragments = compact(currentTime.split(',')
        .map(timeFragment => (relativeTimeRegExp.exec(timeFragment) || {}).groups));
    return timeFragments
        .reduce((day, { op, measure, unit }) => day[opMap[op]](measure, unit), dayjs(relativeTime))
        .format('YYYY-MM-DD');
}

export const opActionMap = {
    [EQUAL](answer, widgetValue) {
        const answers = Array.isArray(answer) ? answer : [answer];
        return answers.includes(widgetValue);
    },
    [RANGE](answer, widgetValue) {
        const [startTime, endTime] = answer || [];
        const realEndTime = formatTimeToString(endTime);
        const realStartTime = formatTimeToString(startTime, realEndTime);
        return dayjs(widgetValue).isBetween(realStartTime, realEndTime);
    }
};

export function separatePropsAndAttrs(componentProps, props) {
    const componentPropKeys = Object.keys(componentProps);
    const allPropKeys = Object.keys(props);
    const attrs = allPropKeys
        .filter(key => !componentPropKeys.includes(key))
        .reduce(
            (result, key) => ({
                ...result,
                [key]: props[key]
            }),
            {}
        );
    const realProps = componentPropKeys.reduce(
        (result, key) => ({
            ...result,
            [key]: props[key]
        }),
        {}
    );

    return { props: realProps, attrs };
}

export function convert2Map(list, uniqueName = 'id') {
    if (!Array.isArray(list)) list = [list];
  
    return list.reduce((result, current) => {
      const key = current[uniqueName];
  
      if (isNil(key)) {
        // eslint-disable-next-line no-console
        console.warn('convert2Map: can not find correct key: ', key, current);
      }
  
      return {
        ...result,
        [key]: current,
      };
    }, {});
  }
  