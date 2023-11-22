import { EditorService } from '~/editor/editor'
import { StageService } from '../stage'
import { StageShapeService } from './shape'

export class ShapeBBoxService {
  constructor(
    private shapeService: StageShapeService,
    private stageService: StageService,
    private editor: EditorService
  ) {}
}
