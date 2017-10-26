import React from 'react';

if (process.env.BROWSER === true) {
  // require('./divider.css');
}

export default function SelectTags(props) {
  let inner = props.categories.map((category, i) => (
    <option
      value={i}
      key={i}
      selected={props.selected}
    >
      {category.emoji}{' '}{category.categoryName}
    </option>
  ));
  return (
    <select
      onChange={(e) => {
        const i = e.target.value;
        if (i === '-1') {
          props.onChange(null);
        } else {
          props.onChange(props.categories[i]);
        }
      }}
    >
      <option value="-1">➡️ Pick a category</option>
      {inner}
    </select>
  );
}
