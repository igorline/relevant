/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

module.exports = function transformPropTypes(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const MODULE_NAME = options['module-name'] || 'prop-types';

  const localPropTypesName = 'PropTypes';

  function guessType(prop) {
    const firstPart = prop.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2').split(' ')[0];
    if (firstPart === 'on'
      || firstPart === 'toggle'
      || firstPart === 'get'
      || firstPart === 'focus'
      || firstPart === 'render'
      || firstPart === 'set'
    ) return 'func';
    if (firstPart === 'is' || firstPart === 'no') return 'bool';
    if (firstPart === 'render') return 'func';

    if (prop.match(/offset/i)) return 'number';
    if (prop.match(/function/i)) return 'func';

    switch (prop) {
      case 'placeholder':
      case 'type':
      case 'error':
      case 'body':
      case 'string':
      case 'domain':
      case '_id':
      case 'postCategory':
      case 'size':
      case 'postImage':
      case 'placeholderText':
      case 'title':
      case 'text':
      case 'className':
        return 'string';

      case 'children':
      case 'cta':
      case 'footer':
        return 'node';

      case 'singlePost':
      case 'share':
      case 'big':
      case 'preview':
      case 'parentEditing':
      case 'showAllMentions':
      case 'editing':
      case 'short':
      case 'loaded':
      case 'redeemed':
      case 'noName':
      case 'nolink':
      case 'modal':
      case 'okToRender':
      case 'visible':
      case 'edit':
        return 'bool';

      case 'focusInput':
      case 'delete':
      case 'changeTab':
      case 'showActionSheet':
      case 'saveEditFunction':
      case 'scrollTo':
      case 'scrollToComment':
      case 'scrollToBottom':
      case 'updatePosition':
      case 'close':
      case 'destroy':
      case 'func':
      case 'dispatch':
      case 'deselectTag':
      case 'selectTag':
      case 'createMessage':
      case 'load':
      case 'cancel':
        return 'func';

      case 'feedUnread':
      case 'maxTextLenght':
      case 'numberOfLines':
      case 'view':
      case 'specialKey':
      case 'level':
      case 'lengthDelta':
      case 'network':
      case 'pageSize':
        return 'number';

      case 'bodyTags':
      case 'selectedTags':
      case 'postTags':
      case 'articleTags':
      case 'inviteList':
      case 'myPostInv':
      case 'phoneNumbers':
      case 'data':
      case 'tabs':
      case 'slides':
      case 'scenes':
      case 'options':
      case 'users':
      case 'tags':
      case 'bodyMentions':
      case 'allTags':
      case 'keywords':
      case 'userList':
      case 'userSearch':
        return 'array';
      default:
        return 'object';
    }
  }

  function hasReactImport() {
    return root
      .find(j.ImportDeclaration, {
        source: { value: 'react' }
      })
      .length > 0;
  }

  function hasPropTypesImport() {
    return root
      .find(j.ImportDeclaration, {
        source: { value: 'prop-types' }
      })
      .length > 0;
  }

  // Program uses ES import syntax
  function useImportSyntax() {
    return root
      .find(j.ImportDeclaration, {
        importKind: 'value'
      })
      .length > 0;
  }


  let hasModifications = false;

  function findReactImport() {
    let target;
    root
      .find(j.ImportDeclaration)
      .forEach(path => {
        const name = path.value.source.value.toLowerCase();
        if (name === 'react-native' || name === 'react') target = path;
      });

    return target;
  }

  // If any PropTypes references exist, add a 'prop-types' import (or require)
  function addPropTypesImportAfterReact() {
    if (useImportSyntax()) {
      // Handle cases where 'prop-types' already exists;
      // eg the file has already been codemodded but more React.PropTypes were added.
      if (hasPropTypesImport()) {
        return;
      }

      const path = findReactImport();
      if (path) {
        const importStatement = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(localPropTypesName))],
          j.literal(MODULE_NAME)
        );

        // If there is a leading comment, retain it
        // https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
        const firstNode = root.find(j.Program).get('body', 0).node;
        const { comments } = firstNode;
        if (comments) {
          delete firstNode.comments;
          importStatement.comments = comments;
        }

        j(path).insertAfter(importStatement);
      }
    }
  }

  function findAllProps() {
    const allProps = new Set();
    root
      .find(j.MemberExpression, { object: { type: 'MemberExpression' } })
      .filter(path =>
        path.node.object && path.node.object.property.name === 'props'
      )
      .forEach(path => {
        allProps.add(path.node.property.name);
      });

    root
      .find(j.MemberExpression)
      .filter(path =>
        path.node.object.name === 'props'
      )
      .forEach(path => {
        allProps.add(path.node.property.name);
      });

    root
      .find(j.VariableDeclarator, { id: { type: 'ObjectPattern' } })
      .filter(path =>
        path.node.init.object
        && path.node.init.object.type === 'ThisExpression'
        && path.node.init.property.name === 'props'

      )
      .forEach(path => {
        path.node.id.properties.forEach(p => p.key && allProps.add(p.key.name));
      });

    return [...allProps];
  }

  function isClass() {
    return root.find(j.ClassDeclaration)
      .length > 0;
  }

  function hasPropsTypesProperty() {
    return root.find(j.ClassProperty)
      .filter(path => path.node.key.name === 'propTypes')
      .length > 0;
  }

  function generatPropTypesObject(props) {
    return props.map(prop => {
      console.log(prop, ':', guessType(prop));
      return j.property(
        'init',
        j.identifier(prop),
        j.memberExpression(
          j.identifier('PropTypes'),
          j.identifier(guessType(prop))
        )
      );
    });
  }

  function addPropTypesProperty(props) {
    root.find(j.ClassBody)
      .forEach(path => {
        const classBody = path.get('body');
        const newClassProp = j.classProperty(
          j.identifier('propTypes'),
          j.objectExpression(generatPropTypesObject(props)),
          null, // typeAnnotation
          true, // static
        );

        classBody.value.unshift(newClassProp);
      });
    hasModifications = true;
  }

  // ignore classes for now
  if (!isClass()) return null;

  if (!hasReactImport()) return null;

  addPropTypesImportAfterReact();
  hasModifications = true;

  if (!hasPropsTypesProperty()) {
    const foundProps = findAllProps();
    if (!foundProps.length) return null;
    addPropTypesProperty(foundProps);
  }

  return hasModifications
    ? root.toSource({ quote: 'single' })
    : null;
};

