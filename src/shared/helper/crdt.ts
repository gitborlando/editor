import { LOG_LEVEL, LogLevel } from 'app/devUserSet/common'
import { isDevMode } from 'app/util/tool/toolUtil'
import * as Immutable from 'immutable'

const immutableDiff = require('immutablediff')

export function amendPatchByCRDT(
  _currentGlobalState: any,
  _prevGlobalState: any,
  _globalStatePatch: any,
  _changeIdObj: any
) {
  // LOG_LEVEL(LogLevel.info, 'CurrentGlobalState', _currentGlobalState.toJS());
  // LOG_LEVEL(LogLevel.info, 'PrevGlobalState', _prevGlobalState.toJS());
  // LOG_LEVEL(LogLevel.info, 'patch', _globalStatePatch.toJS());
  // LOG_LEVEL(LogLevel.info, 'changeIdObj', _changeIdObj);
  const patchArray: any[] = []
  const elementHO = new Set<string>()
  const pageHO = new Set<string>()
  let viewHO = false
  _globalStatePatch.forEach((_singlePatch: any) => {
    const patchPath = _singlePatch.get('path')
    const [, firstProp, secondProp, thirdProp] = patchPath.split('/')
    if (firstProp === 'element' && thirdProp === 'elementHierarchy') {
      const elementId = secondProp
      if (!elementId || elementHO.has(elementId)) return
      elementHO.add(elementId)

      const prevElement = _prevGlobalState.get('element')?.get(elementId)
      if (!prevElement) return
      const currentElement = _currentGlobalState.get('element')?.get(elementId)
      if (!currentElement) return

      const prevElementHierarchy = prevElement.get('elementHierarchy')
      if (!prevElementHierarchy) return
      const currentElementHierarchy = currentElement.get('elementHierarchy')
      if (!currentElementHierarchy) return

      const existElementHierarchyObj = prevElement.get('elementHierarchyObj')?.toJS()
      const prevElementHierarchyObj =
        existElementHierarchyObj || _createHierarchyObjByList(prevElementHierarchy)

      const stableIdWeightMap = new Map<string, number>()
      const stableIdSet = _getStableIdSet(
        prevElementHierarchy,
        currentElementHierarchy,
        _changeIdObj
      )
      stableIdSet.forEach((_stableId) => {
        const weight = prevElementHierarchyObj[_stableId]
        if (typeof weight === 'number') stableIdWeightMap.set(_stableId, weight)
      })

      const currentElementHierarchyObj = _calcHierarchyObj(
        currentElementHierarchy,
        stableIdWeightMap
      )
      if (!existElementHierarchyObj) {
        patchArray.push({
          op: 'add',
          path: `/element/${elementId}/elementHierarchyObj`,
          value: prevElementHierarchyObj,
        })
      }
      const elementHierarchyObjPatch = immutableDiff(
        Immutable.fromJS(prevElementHierarchyObj),
        Immutable.fromJS(currentElementHierarchyObj)
      )
      elementHierarchyObjPatch.forEach((_ehoPatch: any) => {
        const ehoPatch = _ehoPatch.toJS()
        ehoPatch['path'] = `/element/${elementId}/elementHierarchyObj${ehoPatch['path']}`
        patchArray.push(ehoPatch)
      })
    } else if (firstProp === 'page' && thirdProp === 'elementHierarchy') {
      const pageId = secondProp
      if (!pageId || pageHO.has(pageId)) return
      pageHO.add(pageId)

      const prevPage = _prevGlobalState.get('page')?.get(pageId)
      if (!prevPage) return
      const currentPage = _currentGlobalState.get('page')?.get(pageId)
      if (!currentPage) return

      const prevPageHierarchy = prevPage.get('elementHierarchy')
      if (!prevPageHierarchy) return
      const currentPageHierarchy = currentPage.get('elementHierarchy')
      if (!currentPageHierarchy) return

      const existPageHierarchyObj = prevPage.get('elementHierarchyObj')?.toJS()
      const prevPageHierarchyObj =
        existPageHierarchyObj || _createHierarchyObjByList(prevPageHierarchy)

      const stableIdWeightMap = new Map<string, number>()
      const stableIdSet = _getStableIdSet(prevPageHierarchy, currentPageHierarchy, _changeIdObj)
      stableIdSet.forEach((_stableId) => {
        const weight = prevPageHierarchyObj[_stableId]
        if (typeof weight === 'number') stableIdWeightMap.set(_stableId, weight)
      })

      const currentPageHierarchyObj = _calcHierarchyObj(currentPageHierarchy, stableIdWeightMap)
      if (!existPageHierarchyObj) {
        patchArray.push({
          op: 'add',
          path: `/page/${pageId}/elementHierarchyObj`,
          value: prevPageHierarchyObj,
        })
      }
      const pageHierarchyObjPatch = immutableDiff(
        Immutable.fromJS(prevPageHierarchyObj),
        Immutable.fromJS(currentPageHierarchyObj)
      )
      pageHierarchyObjPatch.forEach((_phoPatch: any) => {
        const phoPatch = _phoPatch.toJS()
        phoPatch['path'] = `/page/${pageId}/elementHierarchyObj${phoPatch['path']}`
        patchArray.push(phoPatch)
      })
    } else if (firstProp === 'view' && secondProp === 'hierarchy') {
      if (viewHO) return
      viewHO = true

      const prevView = _prevGlobalState.get('view')
      if (!prevView) return
      const currentView = _currentGlobalState.get('view')
      if (!currentView) return

      const prevViewHierarchy = prevView.get('hierarchy')
      if (!prevViewHierarchy) return
      const currentViewHierarchy = currentView.get('hierarchy')
      if (!currentViewHierarchy) return

      const existViewHierarchyObj = prevView.get('hierarchyObj')?.toJS()
      const prevViewHierarchyObj =
        existViewHierarchyObj || _createHierarchyObjByList(prevViewHierarchy)

      const stableIdWeightMap = new Map<string, number>()
      const stableIdSet = _getStableIdSet(prevViewHierarchy, currentViewHierarchy, _changeIdObj)
      stableIdSet.forEach((_stableId) => {
        const weight = prevViewHierarchyObj[_stableId]
        if (typeof weight === 'number') stableIdWeightMap.set(_stableId, weight)
      })

      const currentViewHierarchyObj = _calcHierarchyObj(currentViewHierarchy, stableIdWeightMap)
      if (!existViewHierarchyObj) {
        patchArray.push({
          op: 'add',
          path: `/view/hierarchyObj`,
          value: prevViewHierarchyObj,
        })
      }
      const viewHierarchyObjPatch = immutableDiff(
        Immutable.fromJS(prevViewHierarchyObj),
        Immutable.fromJS(currentViewHierarchyObj)
      )
      viewHierarchyObjPatch.forEach((_vhoPatch: any) => {
        const vhoPatch = _vhoPatch.toJS()
        vhoPatch['path'] = `/view/hierarchyObj${vhoPatch['path']}`
        patchArray.push(vhoPatch)
      })
    }
  })
  // LOG_LEVEL(LogLevel.info, 'patchArray', patchArray);
  return patchArray
}

/**
 * 通过 子集列表对象 来初始化 子集权值对象
 * @param _hierarchyList
 * @returns
 */
function _createHierarchyObjByList(_hierarchyList: any) {
  const hierarchyObj: any = {}
  if (!_hierarchyList || !Immutable.List.isList(_hierarchyList) || _hierarchyList.size <= 0) {
    return hierarchyObj
  }
  let weight: number = 0
  _hierarchyList.forEach((_childId: any) => {
    if (!_childId) return
    hierarchyObj[_childId] = weight
    weight += 1
  })
  return hierarchyObj
}

/**
 * 获取稳定集合
 * @param _leftHierarchyList
 * @param _rightHierarchyList
 * @param _changeIdObj
 * @returns
 */
function _getStableIdSet(_leftHierarchyList: any, _rightHierarchyList: any, _changeIdObj: any) {
  const leftHierarchyIdSet = new Set<string>()
  _leftHierarchyList.forEach((_childId: any) => {
    if (!_childId) return
    leftHierarchyIdSet.add(_childId)
  })

  const rightHierarchyIdSet = new Set<string>()
  _rightHierarchyList.forEach((_childId: any) => {
    if (!_childId) return
    rightHierarchyIdSet.add(_childId)
  })

  let travelHierarchyIdSet: Set<string>
  let hitHierarchyIdSet: Set<string>
  if (leftHierarchyIdSet.size <= rightHierarchyIdSet.size) {
    travelHierarchyIdSet = leftHierarchyIdSet
    hitHierarchyIdSet = rightHierarchyIdSet
  } else {
    travelHierarchyIdSet = rightHierarchyIdSet
    hitHierarchyIdSet = leftHierarchyIdSet
  }
  const stableIdSet = new Set<string>()
  // 遍历短集合来获取交集
  travelHierarchyIdSet.forEach((_childId) => {
    if (hitHierarchyIdSet.has(_childId)) {
      stableIdSet.add(_childId)
    }
  })
  // 过滤掉发生变化的
  for (const changeId in _changeIdObj) {
    if (changeId) stableIdSet.delete(changeId)
  }
  return stableIdSet
}

/**
 * 根据 稳定集权值 来计算新的 子集权值对象
 * @param _hierarchyList
 * @param _stableIdWeightMap
 * @returns
 */
function _calcHierarchyObj(_hierarchyList: any, _stableIdWeightMap: Map<string, number>) {
  if (_stableIdWeightMap.size <= 0) return _createHierarchyObjByList(_hierarchyList)
  const hierarchyObj: any = {}
  const hierarchyArray: string[] = []
  let hitStableId = false
  _hierarchyList.forEach((_childId: any) => {
    if (_childId) {
      hierarchyArray.push(_childId)
      hitStableId = hitStableId || _stableIdWeightMap.has(_childId)
    }
  })
  if (hierarchyArray.length <= 0) return hierarchyObj
  if (!hitStableId) return _createHierarchyObjByList(Immutable.List(hierarchyArray))

  let prevStableObj: any
  let index = 0
  const hierarchyArrayLen = hierarchyArray.length
  while (index < hierarchyArrayLen) {
    const childId = hierarchyArray[index]
    const stableWeight = _stableIdWeightMap.get(childId)
    if (typeof stableWeight === 'number') {
      if (prevStableObj) {
        const prevStableIndex = prevStableObj['index']
        const prevStableWeight = prevStableObj['weight']
        const weightStep = (stableWeight - prevStableWeight) / (index - prevStableIndex)
        for (let i = prevStableIndex + 1; i <= index; ++i) {
          hierarchyObj[hierarchyArray[i]] = prevStableWeight + weightStep * (i - prevStableIndex)
        }
        prevStableObj = {
          index,
          weight: stableWeight,
        }
      } else {
        prevStableObj = {
          index,
          weight: stableWeight,
        }
        for (let i = index; i >= 0; --i) {
          hierarchyObj[hierarchyArray[i]] = stableWeight - (index - i)
        }
      }
    }
    index += 1
  }
  if (prevStableObj) {
    const stableIndex = prevStableObj['index']
    const stableWeight = prevStableObj['weight']
    for (let i = stableIndex + 1; i < hierarchyArrayLen; ++i) {
      hierarchyObj[hierarchyArray[i]] = stableWeight + (i - stableIndex)
    }
  }

  return hierarchyObj
}

/**
 * 收集 矫正 patch 相关信息
 * @param _autoSaveData
 * @param _infoObj
 * @returns
 */
export function collectCorrectionPatch(_autoSaveData: any, _infoObj: any) {
  if (!_autoSaveData || _autoSaveData.size <= 0) return _infoObj
  const { elementIdSet, pageIdSet } = _infoObj
  _autoSaveData.forEach((_singleAutoSaveData: any) => {
    const pathArray = _singleAutoSaveData?.get('path')?.split('/')
    const elementHierarchyObjIdx = pathArray?.indexOf('elementHierarchyObj')
    if (elementHierarchyObjIdx > 0) {
      const elementHierarchyObjId = pathArray[elementHierarchyObjIdx - 1]
      if (elementHierarchyObjId) {
        const elementHierarchyObjType = pathArray[elementHierarchyObjIdx - 2]
        if (elementHierarchyObjType === 'element') {
          elementIdSet.add(elementHierarchyObjId)
        } else if (elementHierarchyObjType === 'page') {
          pageIdSet.add(elementHierarchyObjId)
        }
      }
    }
    _infoObj.viewFlag = _infoObj.viewFlag || pathArray?.indexOf('hierarchyObj') > 0
  })
  // if (elementIdSet.size > 0 || pageIdSet.size > 0 || _infoObj.viewFlag) {
  //   console.log('collectCorrectionInfo', _autoSaveData?.toJS(), _infoObj);
  // }
  return _infoObj
}

/**
 * 矫正 patch
 * @param _globalState
 * @param _infoObj
 * @returns
 */
export function correctionPatch(_globalState: any, _infoObj: any, _patchArray?: any[]) {
  if (!_globalState) return _globalState

  const devModeLog = isDevMode()

  const { elementIdSet, pageIdSet } = _infoObj

  const globalState = _globalState
  let globalStateUpdate = globalState

  if (elementIdSet.size > 0) {
    const elementState = globalState.get('element')
    if (elementState) {
      let elementStateUpdate = elementState
      elementIdSet.forEach((_elementId: string) => {
        const element = elementStateUpdate.get(_elementId)
        if (!element) return
        const elementHierarchy = element.get('elementHierarchy')
        if (!elementHierarchy) return
        const elementHierarchyObj = element.get('elementHierarchyObj')
        if (!elementHierarchyObj) return
        const elementHierarchyCorrection = _correctionHierarchyListByObj(elementHierarchyObj)
        if (devModeLog && !Immutable.is(elementHierarchy, elementHierarchyCorrection)) {
          LOG_LEVEL(
            LogLevel.info,
            'elementHierarchyCorrection',
            _elementId,
            elementHierarchy.toJS(),
            '->',
            elementHierarchyCorrection.toJS()
          )
        }
        const elementHierarchyCorrectionValid = elementHierarchyCorrection.filter(
          (_elementId: string) => {
            if (!_elementId) return false
            const element = elementState.get(_elementId)
            if (!element) return false
            return true
          }
        )
        if (
          devModeLog &&
          !Immutable.is(elementHierarchyCorrection, elementHierarchyCorrectionValid)
        ) {
          LOG_LEVEL(
            LogLevel.info,
            'elementHierarchyCorrectionValid',
            _elementId,
            elementHierarchyCorrection.toJS(),
            '->',
            elementHierarchyCorrectionValid.toJS()
          )
        }
        if (!Immutable.is(elementHierarchy, elementHierarchyCorrectionValid)) {
          elementStateUpdate = elementStateUpdate.setIn(
            [_elementId, 'elementHierarchy'],
            elementHierarchyCorrectionValid
          )
          _patchArray?.push({
            op: 'replace',
            path: `/element/${_elementId}/elementHierarchy`,
            value: elementHierarchyCorrectionValid.toJS(),
          })
        }
      })
      globalStateUpdate = globalStateUpdate.set('element', elementStateUpdate)
    }
  }

  if (pageIdSet.size > 0) {
    const pageState = globalState.get('page')
    if (pageState) {
      const elementState = globalState.get('element')

      let pageStateUpdate = pageState
      pageIdSet.forEach((_pageId: string) => {
        const page = pageStateUpdate.get(_pageId)
        if (!page) return
        const elementHierarchy = page.get('elementHierarchy')
        if (!elementHierarchy) return
        const elementHierarchyObj = page.get('elementHierarchyObj')
        if (!elementHierarchyObj) return
        const elementHierarchyCorrection = _correctionHierarchyListByObj(elementHierarchyObj)
        if (devModeLog && !Immutable.is(elementHierarchy, elementHierarchyCorrection)) {
          LOG_LEVEL(
            LogLevel.info,
            'page',
            'elementHierarchyCorrection',
            _pageId,
            elementHierarchy.toJS(),
            '->',
            elementHierarchyCorrection.toJS()
          )
        }
        const elementHierarchyCorrectionValid = elementHierarchyCorrection.filter(
          (_elementId: string) => {
            if (!_elementId) return false
            const element = elementState?.get(_elementId)
            if (!element) return false
            return true
          }
        )
        if (
          devModeLog &&
          !Immutable.is(elementHierarchyCorrection, elementHierarchyCorrectionValid)
        ) {
          LOG_LEVEL(
            LogLevel.info,
            'page',
            'elementHierarchyCorrectionValid',
            _pageId,
            elementHierarchyCorrection.toJS(),
            '->',
            elementHierarchyCorrectionValid.toJS()
          )
        }
        if (!Immutable.is(elementHierarchy, elementHierarchyCorrectionValid)) {
          pageStateUpdate = pageStateUpdate.setIn(
            [_pageId, 'elementHierarchy'],
            elementHierarchyCorrectionValid
          )
          _patchArray?.push({
            op: 'replace',
            path: `/page/${_pageId}/elementHierarchy`,
            value: elementHierarchyCorrectionValid.toJS(),
          })
        }
      })
      globalStateUpdate = globalStateUpdate.set('page', pageStateUpdate)
    }
  }

  if (_infoObj.viewFlag) {
    const viewState = globalState.get('view')
    if (viewState) {
      const pageState = globalState.get('page')

      let viewStateUpdate = viewState
      const hierarchy = viewStateUpdate.get('hierarchy')
      if (hierarchy) {
        const hierarchyObj = viewStateUpdate.get('hierarchyObj')
        if (hierarchyObj) {
          const hierarchyCorrection = _correctionHierarchyListByObj(hierarchyObj)
          if (devModeLog && !Immutable.is(hierarchy, hierarchyCorrection)) {
            LOG_LEVEL(
              LogLevel.info,
              'hierarchyCorrection',
              hierarchy.toJS(),
              '->',
              hierarchyCorrection.toJS()
            )
          }
          const hierarchyCorrectionValid = hierarchyCorrection.filter((_pageId: string) => {
            if (!_pageId) return false
            const page = pageState?.get(_pageId)
            if (!page) return false
            return true
          })
          if (devModeLog && !Immutable.is(hierarchyCorrection, hierarchyCorrectionValid)) {
            LOG_LEVEL(
              LogLevel.info,
              'hierarchyCorrectionValid',
              hierarchyCorrection.toJS(),
              '->',
              hierarchyCorrectionValid.toJS()
            )
          }
          if (!Immutable.is(hierarchy, hierarchyCorrectionValid)) {
            viewStateUpdate = viewStateUpdate.set('hierarchy', hierarchyCorrectionValid)
            _patchArray?.push({
              op: 'replace',
              path: '/view/hierarchy',
              value: hierarchyCorrectionValid.toJS(),
            })
          }
        }
      }
      globalStateUpdate = globalStateUpdate.set('view', viewStateUpdate)
    }
  }

  return globalStateUpdate
}

function _correctionHierarchyListByObj(_hierarchyObj: any) {
  if (!_hierarchyObj || !Immutable.Map.isMap(_hierarchyObj)) {
    return Immutable.List()
  }
  const hierarchyArray = _hierarchyObj
    .sort((_leftWeight: number, _rightWeight: number) => {
      if (_leftWeight < _rightWeight) {
        return -1
      } else if (_leftWeight > _rightWeight) {
        return 1
      }
      return 0
    })
    .keySeq()
    .toArray()
  return Immutable.List(hierarchyArray)
}
