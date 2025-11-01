import autobind from 'class-autobind-decorator'

@autobind
class EditorLPLayerStateService {
  @observable pagePanelHeight = 200
}

export const EditorLPLayerState = makeObservable(new EditorLPLayerStateService())
