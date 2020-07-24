# React 源码剖析(六) diff算法

书接上回调度中心，这次来讲react的diff部分算法

### 什么是 diff算法?

计算出Virtual DOM中真正变化的部分，并只针对该部分进行原生DOM操作，而非重新渲染整个页面。

传统diff算法
通过循环递归对节点进行依次对比，算法复杂度达到 O(n^3) ，n是树的节点数，这个有多可怕呢？——如果要展示1000个节点，得执行上亿次比较。。即便是CPU快能执行30亿条命令，也很难在一秒内计算出差异。

diff策略
React用 三大策略 将O(n^3)复杂度 转化为 O(n)复杂度

策略一（tree diff）：
Web UI中DOM节点跨层级的移动操作特别少，可以忽略不计。

策略二（component diff）：
拥有相同类的两个组件 生成相似的树形结构，
拥有不同类的两个组件 生成不同的树形结构。

策略三（element diff）：
对于同一层级的一组子节点，通过唯一id区分。

### 参见详细的diff算法代码

```Javascript
// 当调度中心触发节点更新时，会调用该函数，这个就是diff算法统一的入口函数
// current: 当前节点, React 会为每个 React 元素创建一个 fiber 节点 （FiberNode）
// workInProgress: 上每个节点都有一个effect list，用来存放需要更新的内容。此节点更新完毕会向子节点或邻近节点合并 effect list
function reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime) {
	// console.log("reconcileChildren.caller",reconcileChildren.caller);
	// 是否该组件是首次渲染,如果为null则表示首次渲染
  if (current === null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.
    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderExpirationTime);
	}
}

```

接下来我们会看到不管组件是否是首次渲染，都调用了mountChildFibers这个函数，返回了一个闭包函数，唯一不同的就是入参

```Javascript
var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);
```

当current===null时表明该组件为首次渲染，所以reconcileChildFibers入参是true。
最后reconcileChildFibers和mountChildFibers都是返回reconcileChildFibers的闭包函数

```javascript

	/* 返回filber实例
	* returnFiber 是即将 Diff 的这层的父节点。
	*	currentFirstChild是当前层的第一个 Fiber 节点。
	* newChild 是即将更新的 vdom 节点(可能是 TextNode、可能是 ReactElement，可能是数组)，不是 Fiber 节点
	* expirationTime 是过期时间，这个参数是跟调度有关系的，本系列还没讲解，当然跟 Diff 也没有关系。
	*/
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
		// console.log("reconcileChildFibers.caller",reconcileChildFibers.caller);
		console.log("reconcileChildFibers-------------start");
		console.log("reconcileChildFibers===arguments","returnFiber:",returnFiber,"currentFirstChild:",currentFirstChild,"newChild:",newChild);
		// 判断是否是React.Fragment
		var isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null;

    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    } // Handle object types

		// 判断是否是节点元素
		var isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));

        case REACT_PORTAL_TYPE:
          return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
      }
		}
		console.log("====newChild",newChild);
		// 如果是文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime));
		}
		// 如果是数组节点
		console.log("isArray$1(newChild)",isArray$1(newChild))
    if (isArray$1(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
		}
		console.log("getIteratorFn(newChild)",getIteratorFn(newChild));
    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
    }
		// 元素节点容错
    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
      // If the new child is undefined, and the return fiber is a composite
      // component, throw an error. If Fiber return types are disabled,
      // we already threw above.
      switch (returnFiber.tag) {
        case ClassComponent:
          {
            {
              var instance = returnFiber.stateNode;

              if (instance.render._isMockFunction) {
                // We allow auto-mocks to proceed as if they're returning null.
                break;
              }
            }
          }
        // Intentionally fall through to the next case, which handles both
        // functions and classes
        // eslint-disable-next-lined no-fallthrough

        case FunctionComponent:
          {
            var Component = returnFiber.type;

            {
              {
                throw Error( (Component.displayName || Component.name || 'Component') + "(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null." );
              }
            }
          }
      }
		} // Remaining cases are all treated as empty.
		// 将该fiber及其兄弟fiber标记为删除
		const result = deleteRemainingChildren(returnFiber, currentFirstChild);
		console.log("reconcileChildFibers-------------end",result,returnFiber, currentFirstChild);
		return result;
  }

```


继续往下看ChildReconciler计算的具体实现
```javascript

function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return;
    } // Deletions are added in reversed order so we add it to the front.
    // At this point, the return fiber's effect list is empty except for
    // deletions, so we can just append the deletion to the list. The remaining
    // effects aren't added until the complete phase. Once we implement
    // resuming, this may not be true.


    var last = returnFiber.lastEffect;

    if (last !== null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }

    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
  }
	// 删除剩余节点
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return null;
    } // TODO: For the shouldClone case, this could be micro-optimized a bit by
    // assuming that after the first child we've already added everything.


    var childToDelete = currentFirstChild;

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }

    return null;
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    // Add the remaining children to a temporary map so that we can find them by
    // keys quickly. Implicit (null) keys get added to this set with their index
    // instead.
    var existingChildren = new Map();
    var existingChild = currentFirstChild;

    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }

      existingChild = existingChild.sibling;
    }

    return existingChildren;
  }
	// 复用节点
  function useFiber(fiber, pendingProps) {
    // We currently set sibling to null and index to 0 here because it is easy
    // to forget to do before returning it. E.g. for the single child case.
    var clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;

    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }

    var current = newFiber.alternate;

    if (current !== null) {
      var oldIndex = current.index;

      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.effectTag = Placement;
      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    // This is simpler for the single child case. We only need to do a
    // placement for inserting new children.
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }

    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent, expirationTime) {
    if (current === null || current.tag !== HostText) {
      // Insert
      var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, textContent);
      existing.return = returnFiber;
      return existing;
    }
  }

  function updateElement(returnFiber, current, element, expirationTime) {
    if (current !== null) {
      if (current.elementType === element.type || ( // Keep this check inline so it only runs on the false path:
       isCompatibleFamilyForHotReloading(current, element) )) {
        // Move based on index
        var existing = useFiber(current, element.props);
        existing.ref = coerceRef(returnFiber, current, element);
        existing.return = returnFiber;

        {
          existing._debugSource = element._source;
          existing._debugOwner = element._owner;
        }

        return existing;
      }
    } // Insert


    var created = createFiberFromElement(element, returnFiber.mode, expirationTime);
    created.ref = coerceRef(returnFiber, current, element);
    created.return = returnFiber;
    return created;
  }

  function updatePortal(returnFiber, current, portal, expirationTime) {
    if (current === null || current.tag !== HostPortal || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
      // Insert
      var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, portal.children || []);
      existing.return = returnFiber;
      return existing;
    }
  }

  function updateFragment(returnFiber, current, fragment, expirationTime, key) {
    if (current === null || current.tag !== Fragment) {
      // Insert
      var created = createFiberFromFragment(fragment, returnFiber.mode, expirationTime, key);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, fragment);
      existing.return = returnFiber;
      return existing;
    }
  }

  function createChild(returnFiber, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
      var created = createFiberFromText('' + newChild, returnFiber.mode, expirationTime);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _created = createFiberFromElement(newChild, returnFiber.mode, expirationTime);

            _created.ref = coerceRef(returnFiber, null, newChild);
            _created.return = returnFiber;
            return _created;
          }

        case REACT_PORTAL_TYPE:
          {
            var _created2 = createFiberFromPortal(newChild, returnFiber.mode, expirationTime);

            _created2.return = returnFiber;
            return _created2;
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        var _created3 = createFiberFromFragment(newChild, returnFiber.mode, expirationTime, null);

        _created3.return = returnFiber;
        return _created3;
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }

	// 对比新老的 key 是否相同，来查看是否可以复用老的节点。
  function updateSlot(
		returnFiber, //当前节点的父节点
		oldFiber, //旧节点
		newChild, //待更新的新节点
		expirationTime) {
		console.log("updateSlot","returnFiber:",returnFiber,"oldFiber:",oldFiber,"newChild:",newChild);
    // Update the fiber if the keys match, otherwise return null.
    var key = oldFiber !== null ? oldFiber.key : null;
		//文本节点是没有 key 的
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
			// node.
			//如果老节点有 key 的话，说明是从 ReactElement 节点转变为文本节点了
      // 这样也没关系，可以不间断更新
      if (key !== null) {
        return null;
      }
			//执行updateTextNode，对文本节点进行更新
      return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime);
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
						//前后 key 相同，说明可以复用
            if (newChild.key === key) {
              if (newChild.type === REACT_FRAGMENT_TYPE) {
                return updateFragment(returnFiber, oldFiber, newChild.props.children, expirationTime, key);
              }

              return updateElement(returnFiber, oldFiber, newChild, expirationTime);
            } else {
							//否则不能复用
              return null;
            }
          }

        case REACT_PORTAL_TYPE:
          {
            if (newChild.key === key) {
              return updatePortal(returnFiber, oldFiber, newChild, expirationTime);
            } else {
              return null;
            }
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        if (key !== null) {
          return null;
        }

        return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys, so we neither have to check the old nor
      // new node for the key. If both are text nodes, they match.
      var matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;

            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(returnFiber, _matchedFiber, newChild.props.children, expirationTime, newChild.key);
            }

            return updateElement(returnFiber, _matchedFiber, newChild, expirationTime);
          }

        case REACT_PORTAL_TYPE:
          {
            var _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;

            return updatePortal(returnFiber, _matchedFiber2, newChild, expirationTime);
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        var _matchedFiber3 = existingChildren.get(newIdx) || null;

        return updateFragment(returnFiber, _matchedFiber3, newChild, expirationTime, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }
  /**
   * Warns if there is a duplicate or missing key
   */


  function warnOnInvalidKey(child, knownKeys) {
    {
      if (typeof child !== 'object' || child === null) {
        return knownKeys;
      }

      switch (child.$$typeof) {
        case REACT_ELEMENT_TYPE:
        case REACT_PORTAL_TYPE:
          warnForMissingKey(child);
          var key = child.key;

          if (typeof key !== 'string') {
            break;
          }

          if (knownKeys === null) {
            knownKeys = new Set();
            knownKeys.add(key);
            break;
          }

          if (!knownKeys.has(key)) {
            knownKeys.add(key);
            break;
          }

          error('Encountered two children with the same key, `%s`. ' + 'Keys should be unique so that components maintain their identity ' + 'across updates. Non-unique keys may cause children to be ' + 'duplicated and/or omitted — the behavior is unsupported and ' + 'could change in a future version.', key);

          break;
      }
    }

    return knownKeys;
	}
	
	// https://cloud.tencent.com/developer/article/1555533
  function reconcileChildrenArray(
		returnFiber,
		currentFirstChild,
		newChildren, //待更新的数组节点
		expirationTime) {
		console.log("reconcileChildrenArray",returnFiber, currentFirstChild, newChildren);
    // This algorithm can't optimize by searching from both ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.
    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.
    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.
    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.
    {
      // First, validate keys.
      var knownKeys = null;

      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        knownKeys = warnOnInvalidKey(child, knownKeys);
      }
    }

    var resultingFirstChild = null;
		var previousNewFiber = null;
		//数组中的第一个节点
    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
		var nextOldFiber = null;
		//复用节点的时候，会尽量减少数组遍历的次数
		console.log("oldFiber:",oldFiber);
		//跳出循环的条件是，在遍历新老数组的过程中,找到第一个不能复用的节点
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
			// 当要更新的节点的 index 大于 newIndex 时，
      // 说明它不在所期盼的位置上，则需要“认真处理”oldFiber
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
				oldFiber = null;
			//否则，则处理该节点的下一个兄弟节点
      } else {
        nextOldFiber = oldFiber.sibling;
      }
			//复用或新建节点
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
      //说明key 不相同，节点不能复用，此时就跳出循环
      //如果不跳出循环，说明可以是相同的
      //也就是说当跳出循环的时候，我们可以知道截至目前，复用节点的个数，和不可复用节点的 index，
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }

        break;
      }
			//初次渲染的情况下
      if (shouldTrackSideEffects) {
				//newFiber.alternate表示并没有复用 oldFiber 来赋值,而是 return 了新的 fiber
				//所以要删除存在的 旧的fiber
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
			//将 newFiber 节点挂载到 DOM 树上，返回最新移动的 index
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
			//表示是新节点
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    //跳出循环后
    //index=length，说明截止到最后，所有节点都是可以复用的
    //故可以删除老节点
    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
			// since the rest will all be insertions.
			//老节点已经被复用完，但是仍有部分新节点没有被创建
      for (; newIdx < newChildren.length; newIdx++) {
				//新建节点
        var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);

        if (_newFiber === null) {
          continue;
        }

        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = _newFiber;
        } else {
          previousNewFiber.sibling = _newFiber;
        }

        previousNewFiber = _newFiber;
      }

      return resultingFirstChild;
    } // Add all children to a key map for quick lookups.

		//数组可能存在顺序的变化，oldfiber和 newfiber 还有可以复用的 fiber 节点
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber); // Keep scanning and use the map to restore deleted items as moves.
		//继续遍历剩下的 new 节点
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);

      if (_newFiber2 !== null) {
        if (shouldTrackSideEffects) {
					//不为 null 说明 fiber 节点已经被复用了,所以可以从 Map 中删除
          if (_newFiber2.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(_newFiber2.key === null ? newIdx : _newFiber2.key);
          }
        }

        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2;
        } else {
          previousNewFiber.sibling = _newFiber2;
        }

        previousNewFiber = _newFiber2;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
			// to add them to the deletion list.
			//删除没有复用的节点
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }

  function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
    // This is the same implementation as reconcileChildrenArray(),
    // but using the iterator instead.
    var iteratorFn = getIteratorFn(newChildrenIterable);

    if (!(typeof iteratorFn === 'function')) {
      {
        throw Error( "An object is not an iterable. This error is likely caused by a bug in React. Please file an issue." );
      }
    }

    {
      // We don't support rendering Generators because it's a mutation.
      // See https://github.com/facebook/react/issues/12995
      if (typeof Symbol === 'function' && // $FlowFixMe Flow doesn't know about toStringTag
      newChildrenIterable[Symbol.toStringTag] === 'Generator') {
        if (!didWarnAboutGenerators) {
          error('Using Generators as children is unsupported and will likely yield ' + 'unexpected results because enumerating a generator mutates it. ' + 'You may convert it to an array with `Array.from()` or the ' + '`[...spread]` operator before rendering. Keep in mind ' + 'you might need to polyfill these features for older browsers.');
        }

        didWarnAboutGenerators = true;
      } // Warn about using Maps as children


      if (newChildrenIterable.entries === iteratorFn) {
        if (!didWarnAboutMaps) {
          error('Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.');
        }

        didWarnAboutMaps = true;
      } // First, validate keys.
      // We'll get a different iterator later for the main pass.


      var _newChildren = iteratorFn.call(newChildrenIterable);

      if (_newChildren) {
        var knownKeys = null;

        var _step = _newChildren.next();

        for (; !_step.done; _step = _newChildren.next()) {
          var child = _step.value;
          knownKeys = warnOnInvalidKey(child, knownKeys);
        }
      }
    }

    var newChildren = iteratorFn.call(newChildrenIterable);

    if (!(newChildren != null)) {
      {
        throw Error( "An iterable object provided no iterator." );
      }
    }

    var resultingFirstChild = null;
    var previousNewFiber = null;
    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
    var nextOldFiber = null;
    var step = newChildren.next();

    for (; oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }

      var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);

      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }

        break;
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (step.done) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; !step.done; newIdx++, step = newChildren.next()) {
        var _newFiber3 = createChild(returnFiber, step.value, expirationTime);

        if (_newFiber3 === null) {
          continue;
        }

        lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = _newFiber3;
        } else {
          previousNewFiber.sibling = _newFiber3;
        }

        previousNewFiber = _newFiber3;
      }

      return resultingFirstChild;
    } // Add all children to a key map for quick lookups.


    var existingChildren = mapRemainingChildren(returnFiber, oldFiber); // Keep scanning and use the map to restore deleted items as moves.

    for (; !step.done; newIdx++, step = newChildren.next()) {
      var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);

      if (_newFiber4 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber4.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren.delete(_newFiber4.key === null ? newIdx : _newFiber4.key);
          }
        }

        lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber4;
        } else {
          previousNewFiber.sibling = _newFiber4;
        }

        previousNewFiber = _newFiber4;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
		console.log("reconcileSingleTextNode",returnFiber, currentFirstChild, textContent);
    // There's no need to check for keys on text nodes since we don't have a
    // way to define them.
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      // We already have an existing node so let's just update it and delete
      // the rest.
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      var existing = useFiber(currentFirstChild, textContent);
      existing.return = returnFiber;
      return existing;
    } // The existing first child is not a text node so we need to create one
    // and delete the existing ones.


    deleteRemainingChildren(returnFiber, currentFirstChild);
    var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
    created.return = returnFiber;
    return created;
  }

	// 具体的Diff算法
  function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
    var key = element.key;
    var child = currentFirstChild;
		// 首先判断是否存在对应DOM节点
    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
			// the first item in the list.
			// 上一次更新存在DOM节点，接下来判断是否可复用
			// 首先比较key是否相同
      if (child.key === key) {
				console.log("===one",child,child.key,key);
				// key相同，接下来比较type是否相同
        switch (child.tag) {
          case Fragment:
            {
              if (element.type === REACT_FRAGMENT_TYPE) {
                deleteRemainingChildren(returnFiber, child.sibling);
                var existing = useFiber(child, element.props.children);
                existing.return = returnFiber;

                {
                  existing._debugSource = element._source;
                  existing._debugOwner = element._owner;
                }

                return existing;
              }

              break;
            }

          case Block:

          // We intentionally fallthrough here if enableBlocksAPI is not on.
          // eslint-disable-next-lined no-fallthrough

          default:
            {
							console.log("===two",child.elementType,element.type);
              if (child.elementType === element.type || ( // Keep this check inline so it only runs on the false path:
               isCompatibleFamilyForHotReloading(child, element) )) {
                deleteRemainingChildren(returnFiber, child.sibling);

                var _existing3 = useFiber(child, element.props);

                _existing3.ref = coerceRef(returnFiber, child, element);
                _existing3.return = returnFiber;

                {
                  _existing3._debugSource = element._source;
                  _existing3._debugOwner = element._owner;
                }
								// 返回复用的fiber
                return _existing3;
              }
							// type不同则跳出循环
              break;
            }
        } // Didn't match.

     	 	// 代码执行到这里代表：key相同但是type不同
      	// 将该fiber及其兄弟fiber标记为删除
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
				// key不同，将该fiber标记为删除
        deleteChild(returnFiber, child);
      }

      child = child.sibling;
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(element.props.children, returnFiber.mode, expirationTime, element.key);
      created.return = returnFiber;
      return created;
    } else {
      var _created4 = createFiberFromElement(element, returnFiber.mode, expirationTime);

      _created4.ref = coerceRef(returnFiber, currentFirstChild, element);
      _created4.return = returnFiber;
      return _created4;
    }
  }

  function reconcileSinglePortal(returnFiber, currentFirstChild, portal, expirationTime) {
    var key = portal.key;
    var child = currentFirstChild;

    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
      if (child.key === key) {
        if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(child, portal.children || []);
          existing.return = returnFiber;
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }

      child = child.sibling;
    }

		// 返回创建新的Fiber
    var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
    created.return = returnFiber;
    return created;
	} 
	
	/* 返回filber实例
	* returnFiber 是即将 Diff 的这层的父节点。
	*	currentFirstChild是当前层的第一个 Fiber 节点。
	* newChild 是即将更新的 vdom 节点(可能是 TextNode、可能是 ReactElement，可能是数组)，不是 Fiber 节点
	* expirationTime 是过期时间，这个参数是跟调度有关系的，本系列还没讲解，当然跟 Diff 也没有关系。
	*/
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
		// console.log("reconcileChildFibers.caller",reconcileChildFibers.caller);
		console.log("reconcileChildFibers-------------start");
		console.log("reconcileChildFibers===arguments","returnFiber:",returnFiber,"currentFirstChild:",currentFirstChild,"newChild:",newChild);
		// 判断是否是React.Fragment
		var isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null;

    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    } // Handle object types

		// 判断是否是节点元素
		var isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));

        case REACT_PORTAL_TYPE:
          return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
      }
		}
		console.log("====newChild",newChild);
		// 如果是文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime));
		}
		// 如果是数组节点
		console.log("isArray$1(newChild)",isArray$1(newChild))
    if (isArray$1(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
		}
		console.log("getIteratorFn(newChild)",getIteratorFn(newChild));
    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
    }
		// 元素节点容错
    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
      // If the new child is undefined, and the return fiber is a composite
      // component, throw an error. If Fiber return types are disabled,
      // we already threw above.
      switch (returnFiber.tag) {
        case ClassComponent:
          {
            {
              var instance = returnFiber.stateNode;

              if (instance.render._isMockFunction) {
                // We allow auto-mocks to proceed as if they're returning null.
                break;
              }
            }
          }
        // Intentionally fall through to the next case, which handles both
        // functions and classes
        // eslint-disable-next-lined no-fallthrough

        case FunctionComponent:
          {
            var Component = returnFiber.type;

            {
              {
                throw Error( (Component.displayName || Component.name || 'Component') + "(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null." );
              }
            }
          }
      }
		} // Remaining cases are all treated as empty.
		// 将该fiber及其兄弟fiber标记为删除
		const result = deleteRemainingChildren(returnFiber, currentFirstChild);
		console.log("reconcileChildFibers-------------end",result,returnFiber, currentFirstChild);
		return result;
  }

  return reconcileChildFibers;
}

```

### 总结

diff算法的基本流程：
先判断节点是否是首次渲染，如果是首次渲染就直接建立虚拟节点。
如果改节点已经渲染过，那么就看是遍历节点，然后根据节点类型再做下一步比对。
如果key(updateSlot：对比新老的 key 是否相同，来查看是否可以复用老的节点)值一样，再判断key是否为null，如果不为null就保留父节点继续比对子节点。
如果类型一样又是文本节点就可以直接复用，如果不是文本节点key为null类型又不用就重新建立节点。