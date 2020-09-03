import _ from 'lodash';

export function isComponent(component) {
  return _.isObject(component) && _.isFunction(component.render);
}

// 隔离组件
export const ISOLATION = 'ISOLATION';
// 表单组件
export const FORM = 'FORM';
// 展示组件
export const PRESENTATIONAL  = 'PRESENTATIONAL';

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