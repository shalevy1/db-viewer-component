import {
  segmentIntersection
} from './mathUtil.js';
import constant from './const.js';

const PATH_ARROW_LENGTH = 9;
const PATH_ARROW_HEIGHT = 4;
const PATH_START = 5;
const PATH_SELF_RELATION_LENGTH = 40;

export default class Relation {
  constructor({
    fromColumn,
    fromPathCount,
    fromPathIndex,
    fromTable,
    toColumn,
    toPathCount,
    toPathIndex,
    toTable,
  }) {
    this.fromColumn = fromColumn;
    this.fromPathCount = fromPathCount;
    this.fromPathIndex = fromPathIndex;
    this.fromTable = fromTable;
    this.toColumn = toColumn;
    this.toPathCount = toPathCount;
    this.toPathIndex = toPathIndex;
    this.toTable = toTable;
  }

  update() {
    this._getTableRelationSide();
  }

  _getPosOnLine(pathIndex, pathCount, sideLength) {
    return (pathIndex + 1) * (sideLength / (pathCount + 1));
  }

  _getLeftSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.left.p2.y - tableSides.left.p1.y;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return {
      y: tableSides.left.p1.y + posOnLine,
      x: tableSides.left.p1.x
    };
  }

  _getRightSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.right.p2.y - tableSides.right.p1.y;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return {
      y: tableSides.right.p1.y + posOnLine,
      x: tableSides.right.p1.x
    };
  }

  _getTopSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.top.p2.x - tableSides.top.p1.x;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return {
      y: tableSides.top.p1.y,
      x: tableSides.top.p1.x + posOnLine
    };
  }

  _getBottomSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.bottom.p2.x - tableSides.bottom.p1.x;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return {
      y: tableSides.bottom.p1.y,
      x: tableSides.bottom.p1.x + posOnLine
    };
  }

  _get2LinePathFlatTop(start, end, oneTo, toMany) {
    let dArrow;
    let dStartLine;
    let dPath;

    if (start.y > end.y) {
      if (oneTo) {
        dStartLine = `M ${start.x - PATH_START} ${start.y - PATH_START}
                      h ${2 * PATH_START}`;
        dPath = `M ${start.x} ${start.y}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x, start.y - PATH_START);
        dPath = `M ${start.x} ${start.y - PATH_START * 2}`;
      }
      dPath += ` V ${end.y} H ${end.x}`;

      if (start.x > end.x) {
        dArrow = this._getArrow(end, toMany, 'left');
      } else {
        dArrow = this._getArrow(end, toMany, 'right');
      }
    } else {
      if (oneTo) {
        if (start.x > end.x) {
          dStartLine = `M ${start.x - PATH_START} `;
        } else {
          dStartLine = `M ${start.x + PATH_START} `;
        }
        dStartLine += `${start.y - PATH_START} v ${2 * PATH_START}`;
        dPath = `M ${start.x} ${start.y} H ${end.x} V ${end.y}`;
      } else { // zero to
        if (start.x > end.x) {
          dStartLine = this._getCirclePath(start.x - PATH_START, start.y);
        } else {
          dStartLine = this._getCirclePath(start.x + PATH_START, start.y);
        }
        if (start.x > end.x) {
          dPath = `M ${start.x - PATH_START * 2}`;
        } else {
          dPath = `M ${start.x + PATH_START * 2}`;
        }
        dPath += ` ${start.y} H ${end.x} V ${end.y}`;
      }
      dArrow = this._getArrow(end, toMany, 'bottom');
    }

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _get2LinePathFlatBottom(start, end, oneTo, toMany) {
    let dArrow;
    let dStartLine;
    let dPath;

    if (start.y > end.y) {
      if (oneTo) {
        if (start.x > end.x) {
          dStartLine = `M ${start.x - PATH_START} `;
        } else {
          dStartLine = `M ${start.x + PATH_START} `;
        }
        dStartLine += `${start.y - PATH_START} v ${PATH_START * 2}`;
        dPath = `M ${start.x} ${start.y} H ${end.x} V ${end.y}`;
      } else { // zero to
        if (start.x > end.x) {
          dStartLine = this._getCirclePath(start.x - PATH_START, start.y);
          dPath = `M ${start.x - PATH_START * 2} ${start.y} H ${end.x} V ${end.y}`;
        } else {
          dStartLine = this._getCirclePath(start.x + PATH_START, start.y);
          dPath = `M ${start.x + PATH_START * 2} ${start.y} H ${end.x} V ${end.y}`;
        }
      }
      dArrow = this._getArrow(end, toMany, 'top');
    } else {
      if (oneTo) {
        dStartLine = `M ${start.x - PATH_START} ${start.y + PATH_START} h ${2 * PATH_START}`;
        dPath = `M ${start.x} ${start.y} V ${end.y} H ${end.x}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x, start.y + PATH_START);
        dPath = `M ${start.x} ${start.y + PATH_START * 2} V ${end.y} H ${end.x}`;
      }
      if (start.x > end.x) {
        dArrow = this._getArrow(end, toMany, 'left');
      } else {
        dArrow = this._getArrow(end, toMany, 'right');
      }
    }

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _get3LinePathHoriz(start, end, oneTo, toMany) {
    let dStartLine;
    let dPath;
    const p2X = start.x + (end.x - start.x) / 2;
    let dArrow;
    if (start.x > end.x) {
      dArrow = this._getArrow(end, toMany, 'left');
      dPath = `M ${start.x} ${start.y}`;
      if (oneTo) {
        dStartLine = `M ${start.x - PATH_START} ${start.y - PATH_START} v ${2* PATH_START}`;
        dPath += `H ${p2X}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x - PATH_START, start.y);
        dPath += `m ${-PATH_START * 2} 0 H ${p2X}`;
      }
    } else {
      dArrow = this._getArrow(end, toMany, 'right');
      dPath = `M ${start.x} ${start.y} `;
      if (oneTo) {
        dStartLine = `M ${start.x + PATH_START} ${start.y - PATH_START} v ${2* PATH_START}`;
        dPath += `H ${p2X}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x + PATH_START, start.y);
        dPath += `m ${PATH_START * 2} 0 H ${p2X}`;
      }
    }

    dPath += `V ${end.y} H ${end.x}`;

    const d = `${dStartLine} ${dPath} ${dArrow}`;
    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _get3LinePathVert(start, end, oneTo, toMany) {
    let dStartLine = `M ${start.x - PATH_START} `;

    let dPath;
    const p2Y = start.y + (end.y - start.y) / 2;
    let dArrow;
    if (start.y > end.y) {
      dArrow = this._getArrow(end, toMany, 'top');
      if (oneTo) {
        dStartLine += `${start.y - PATH_START} h ${2* PATH_START}`;
        dPath = `M ${start.x} ${start.y} V ${p2Y} H ${end.x} V ${end.y}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x, start.y - PATH_START);
        dPath = `M ${start.x} ${start.y - PATH_START * 2} V ${p2Y} H ${end.x} V ${end.y}`;
      }
    } else {
      dArrow = this._getArrow(end, toMany, 'bottom');
      dStartLine += `${start.y + PATH_START} h ${2* PATH_START}`;
      if (oneTo) {
        dPath = `M ${start.x} ${start.y} V ${p2Y} H ${end.x} V ${end.y}`;
      } else { // zero to
        dStartLine = this._getCirclePath(start.x, start.y + PATH_START);
        dPath = `M ${start.x} ${start.y + PATH_START * 2} V ${p2Y} H ${end.x} V ${end.y}`;
      }
    }

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _getSelfRelationLeft(start, end, oneTo, toMany) {
    let dStartLine;
    let dPath;

    if (oneTo) {
      dStartLine = `M ${start.x - PATH_START} ${start.y - PATH_START} v ${PATH_START * 2}`;
      dPath = `M ${start.x} ${start.y} h ${-PATH_SELF_RELATION_LENGTH} V ${end.y} h ${PATH_SELF_RELATION_LENGTH}`;
    } else {
      dStartLine = this._getCirclePath(start.x - PATH_START, start.y);
      dPath = `M ${start.x - PATH_START * 2} ${start.y} h ${-PATH_SELF_RELATION_LENGTH + PATH_START * 2} V ${end.y} h ${PATH_SELF_RELATION_LENGTH}`;
    }

    const dArrow = this._getArrow(end, toMany, 'right');

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _getSelfRelationRight(start, end, oneTo, toMany) {
    let dStartLine;
    let dPath;

    if (oneTo) {
      dStartLine = `M ${start.x + PATH_START} ${start.y - PATH_START} v ${PATH_START * 2}`;
      dPath = `M ${start.x} ${start.y} h ${PATH_SELF_RELATION_LENGTH} V ${end.y} h ${-PATH_SELF_RELATION_LENGTH}`;
    } else {
      dStartLine = this._getCirclePath(start.x + PATH_START, start.y);
      dPath = `M ${start.x + PATH_START * 2} ${start.y} h ${PATH_SELF_RELATION_LENGTH - PATH_START * 2} V ${end.y} h ${-PATH_SELF_RELATION_LENGTH}`;
    }

    const dArrow = this._getArrow(end, toMany, 'left');

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _getSelfRelationTop(start, end, oneTo, toMany) {
    let dStartLine;
    let dPath;

    if (oneTo) {
      dStartLine = `M ${start.x - PATH_START} ${start.y - PATH_START} h ${PATH_START * 2}`;
      dPath = `M ${start.x} ${start.y} v ${-PATH_SELF_RELATION_LENGTH} H ${end.x} v ${PATH_SELF_RELATION_LENGTH}`;
    } else {
      dStartLine = this._getCirclePath(start.x, start.y - PATH_START);
      dPath = `M ${start.x} ${start.y - PATH_START * 2} v ${-PATH_SELF_RELATION_LENGTH + PATH_START * 2} H ${end.x} v ${PATH_SELF_RELATION_LENGTH}`;
    }

    const dArrow = this._getArrow(end, toMany, 'bottom');

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _getSelfRelationBottom(start, end, oneTo, toMany) {
    let dStartLine;
    let dPath;
    if (oneTo) {
      dPath = `M ${start.x} ${start.y} v ${PATH_SELF_RELATION_LENGTH} H ${end.x} v ${-PATH_SELF_RELATION_LENGTH}`;
      dStartLine = `M ${start.x - PATH_START} ${start.y + PATH_START} h ${PATH_START * 2}`;
    } else {
      dStartLine = this._getCirclePath(start.x, start.y + PATH_START);
      dPath = `M ${start.x} ${start.y + PATH_START * 2} v ${PATH_SELF_RELATION_LENGTH - PATH_START * 2} H ${end.x} v ${-PATH_SELF_RELATION_LENGTH}`;
    }

    const dArrow = this._getArrow(end, toMany, 'top');

    const d = `${dStartLine} ${dPath} ${dArrow}`;

    const path = this._createPath(d);

    const highlight = this._createHighlightTrigger(d);

    return {
      path,
      highlight
    };
  }

  _getCirclePath(x, y) {
    return `M ${x - PATH_START} ${y}` +
          ` a 1,1 0 1,0 ${PATH_START * 2},0 a 1,1 0 1,0 ${-PATH_START * 2},0`;
  }

  _getArrow({x, y}, toMany, orientation) {
    switch (orientation) {
      case 'top':
      if (toMany) {
        return `M ${x} ${y + PATH_ARROW_LENGTH} l ${PATH_ARROW_HEIGHT} ${-PATH_ARROW_LENGTH} ` +
          `M ${x} ${y + PATH_ARROW_LENGTH} l ${-PATH_ARROW_HEIGHT} ${-PATH_ARROW_LENGTH}`;
      } else {
        return `M ${x} ${y} l ${PATH_ARROW_HEIGHT} ${PATH_ARROW_LENGTH} ` +
          `M ${x} ${y} l ${-PATH_ARROW_HEIGHT} ${PATH_ARROW_LENGTH}`;
      }
      case 'bottom':
      if (toMany) {
        return `M ${x} ${y - PATH_ARROW_LENGTH} l ${PATH_ARROW_HEIGHT} ${PATH_ARROW_LENGTH} ` +
          `M ${x} ${y - PATH_ARROW_LENGTH} l ${-PATH_ARROW_HEIGHT} ${PATH_ARROW_LENGTH}`;
      } else {
        return `M ${x} ${y} l ${PATH_ARROW_HEIGHT} ${-PATH_ARROW_LENGTH} ` +
          `M ${x} ${y} l ${-PATH_ARROW_HEIGHT} ${-PATH_ARROW_LENGTH}`;
      }
      case 'left':
      if (toMany) {
        return `M ${x + PATH_ARROW_LENGTH} ${y} l ${-PATH_ARROW_LENGTH} ${PATH_ARROW_HEIGHT} ` +
          `M ${x + PATH_ARROW_LENGTH} ${y} l ${-PATH_ARROW_LENGTH} ${-PATH_ARROW_HEIGHT}`;
      } else {
        return `M ${x} ${y} l ${PATH_ARROW_LENGTH} ${PATH_ARROW_HEIGHT} ` +
          `M ${x} ${y} l ${PATH_ARROW_LENGTH} ${-PATH_ARROW_HEIGHT}`;
      }
      case 'right':
      if (toMany) {
        return `M ${x - PATH_ARROW_LENGTH} ${y} l ${PATH_ARROW_LENGTH} ${PATH_ARROW_HEIGHT} ` +
          `M ${x - PATH_ARROW_LENGTH} ${y} l ${PATH_ARROW_LENGTH} ${-PATH_ARROW_HEIGHT}`;
      } else {
        return `M ${x} ${y} l ${-PATH_ARROW_LENGTH} ${PATH_ARROW_HEIGHT} ` +
          `M ${x} ${y} l ${-PATH_ARROW_LENGTH} ${-PATH_ARROW_HEIGHT}`;
      }
    }
  }

  removeHoverEffect() {
    this._onMouseLeave();
  }

  _onMouseEnter() {
    this.pathElem.classList.add('pathHover');
    this.fromTable.highlightFrom(this.fromColumn);
    this.toTable.highlightTo(this.toColumn);
  }

  _onMouseLeave() {
    if (this.pathElem) {
      this.pathElem.classList.remove('pathHover');
      this.fromTable.removeHighlightFrom(this.fromColumn);
      this.toTable.removeHighlightTo(this.toColumn);
    }
  }

  _setElems(elem, highlightTrigger) {
    this.pathElem = elem;
    this.highlightTrigger = highlightTrigger;
    highlightTrigger.onmouseenter = this._onMouseEnter.bind(this);
    highlightTrigger.onmouseleave = this._onMouseLeave.bind(this);
  }

  _createHighlightTrigger(d) {
    const path = document.createElementNS(constant.nsSvg, 'path');
    path.setAttributeNS(null, 'd', d);
    path.classList.add('highlight');

    return path;
  }

  _createPath(d) {
    const path = document.createElementNS(constant.nsSvg, 'path');

    path.setAttributeNS(null, 'd', d);

    return path;
  }

  render() {
    const fromTableSides = this.fromTable.getSides();
    const toTableSides = this.toTable.getSides();

    const toMany = !this.fromColumn.uq;

    let startMethod;
    let endMethod;
    let resultMethod;

    switch (this.fromTablePathSide) {
      case constant.PATH_LEFT:
        {
          startMethod = this._getLeftSidePathCord;
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              endMethod = this._getLeftSidePathCord;
              resultMethod = this._getSelfRelationLeft;
              break;
            case constant.PATH_RIGHT:
              endMethod = this._getRightSidePathCord;
              resultMethod = this._get3LinePathHoriz;
              break;
            case constant.PATH_TOP:
              endMethod = this._getTopSidePathCord;
              resultMethod = this._get2LinePathFlatTop;
              break;
            case constant.PATH_BOTTOM:
              endMethod = this._getBottomSidePathCord;
              resultMethod = this._get2LinePathFlatBottom;
              break;
          }
        }
        break;
      case constant.PATH_RIGHT:
        {
          startMethod = this._getRightSidePathCord;
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              endMethod = this._getLeftSidePathCord;
              resultMethod = this._get3LinePathHoriz;
              break;
            case constant.PATH_RIGHT:
              endMethod = this._getRightSidePathCord;
              resultMethod = this._getSelfRelationRight;
              break;
            case constant.PATH_TOP:
              endMethod = this._getTopSidePathCord;
              resultMethod = this._get2LinePathFlatTop;
              break;
            case constant.PATH_BOTTOM:
              endMethod = this._getBottomSidePathCord;
              resultMethod = this._get2LinePathFlatBottom;
              break;
          }
        }
        break;
      case constant.PATH_TOP:
        {
          startMethod = this._getTopSidePathCord;
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              endMethod = this._getLeftSidePathCord;
              resultMethod = this._get2LinePathFlatTop;
              break;
            case constant.PATH_RIGHT:
              endMethod = this._getRightSidePathCord;
              resultMethod = this._get2LinePathFlatTop;
              break;
            case constant.PATH_TOP:
              endMethod = this._getTopSidePathCord;
              resultMethod = this._getSelfRelationTop;
              break;
            case constant.PATH_BOTTOM:
              endMethod = this._getBottomSidePathCord;
              resultMethod = this._get3LinePathVert;
              break;
          }
        }
        break;
      case constant.PATH_BOTTOM:
        {
          startMethod = this._getBottomSidePathCord;
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              endMethod = this._getLeftSidePathCord;
              resultMethod = this._get2LinePathFlatBottom;
              break;
            case constant.PATH_RIGHT:
              endMethod = this._getRightSidePathCord;
              resultMethod = this._get2LinePathFlatBottom;
              break;
            case constant.PATH_TOP:
              endMethod = this._getTopSidePathCord;
              resultMethod = this._get3LinePathVert;
              break;
            case constant.PATH_BOTTOM:
              endMethod = this._getBottomSidePathCord;
              resultMethod = this._getSelfRelationBottom;
              break;
          }
        }
        break;
    }

    // In case of tables overlapping there won't be any result
    if (startMethod && endMethod) {
      const start = startMethod.call(this, fromTableSides, this.fromPathIndex, this.fromPathCount);
      const end = endMethod.call(this, toTableSides, this.toPathIndex, this.toPathCount);
      const result = resultMethod.call(this, start, end, this.fromColumn.nn, toMany);
      this._setElems(result.path, result.highlight);
    }
    if (!this.pathElem) return [];
    return [this.highlightTrigger, this.pathElem];
  }

  sameTableRelation() {
    return this.fromTable === this.toTable;
  }

  calcPathTableSides() {
    if (this.fromTable === this.toTable) {
      return this;
    }
    const fromTableCenter = this.fromTable.getCenter();
    const toTableCenter = this.toTable.getCenter();

    const fromTableSides = this.fromTable.getSides();

    const intersectFromTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
    if (intersectFromTableRightSide) {
      this.fromIntersectPoint = intersectFromTableRightSide;
      this.fromTablePathSide = constant.PATH_RIGHT;
    }
    const intersectFromTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
    if (intersectFromTableLeftSide) {
      this.fromIntersectPoint = intersectFromTableLeftSide;
      this.fromTablePathSide = constant.PATH_LEFT;
    }
    const intersectFromTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
    if (intersectFromTableTopSide) {
      this.fromIntersectPoint = intersectFromTableTopSide;
      this.fromTablePathSide = constant.PATH_TOP;
    }
    const intersectFromTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
    if (intersectFromTableBottomSide) {
      this.fromIntersectPoint = intersectFromTableBottomSide;
      this.fromTablePathSide = constant.PATH_BOTTOM;
    }

    const toTableSides = this.toTable.getSides();

    const intersectToTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.right.p1, toTableSides.right.p2);
    if (intersectToTableRightSide) {
      this.toIntersectPoint = intersectToTableRightSide;
      this.toTablePathSide = constant.PATH_RIGHT;
    }
    const intersectToTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.left.p1, toTableSides.left.p2);
    if (intersectToTableLeftSide) {
      this.toIntersectPoint = intersectToTableLeftSide;
      this.toTablePathSide = constant.PATH_LEFT;
    }
    const intersectToTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.top.p1, toTableSides.top.p2);
    if (intersectToTableTopSide) {
      this.toIntersectPoint = intersectToTableTopSide;
      this.toTablePathSide = constant.PATH_TOP;
    }
    const intersectToTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.bottom.p1, toTableSides.bottom.p2);
    if (intersectToTableBottomSide) {
      this.toIntersectPoint = intersectToTableBottomSide;
      this.toTablePathSide = constant.PATH_BOTTOM;
    }
  }

  getElems() {
    if (!this.pathElem) {
      return [];
    }
    return [this.pathElem, this.highlightTrigger];
  }

  static _sort(arr, table, axis) {
    arr.sort((r1, r2) => {
      if (r1.fromIntersectPoint == null || r2.fromIntersectPoint == null) {
        return -1;
      }
      if (r1.fromTable === table) {
        if (r2.fromTable === table) {
          return r1.fromIntersectPoint[axis] - r2.fromIntersectPoint[axis];
        }
        return r1.fromIntersectPoint[axis] - r2.toIntersectPoint[axis];
      } else {
        if (r2.fromTable === table) {
          return r1.toIntersectPoint[axis] - r2.fromIntersectPoint[axis];
        }
        return r1.toIntersectPoint[axis] - r2.toIntersectPoint[axis];
      }
    });
  }

  static ySort(arr, table) {
    return Relation._sort(arr, table, 'y');
  }

  static xSort(arr, table) {
    return Relation._sort(arr, table, 'x');
  }
}