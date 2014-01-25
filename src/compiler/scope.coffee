class GrammarBase
	constructor: (@nodeType, @meta) ->
	getNodeDesc: -> @nodeType

class FragFn extends GrammarBase
	constructor: (@name, @params, @action, meta) ->
	  super("FF", meta)	  

class FFAction extends GrammarBase
	constructor: (@caseTreeList, @where, meta) ->
	  super("FFAction", meta)
	  
	execute: (treeNode, yields, e, scope) ->
	  ctl = @caseTreeList
	  root = ctl[0]
	  root.apply(treeNode) if root.matches(treeNode)	else null

class FFCaseTree extends GrammarBase
	constructor: (@nodeId, @nodeDef, meta) ->
	  super("FFCaseTree", meta)
	  
	apply: (treeNode) ->
	matches: (treeNode) ->
	  

class FFNodeDef extends GrammarBase
	constructor: (@dtDef, @btDef, @caseTreeList, @tOrder, meta) ->
	  super("FFNodeDef", meta)

class FFNodeFn extends GrammarBase
	constructor: (@preRecFn, @postRefFn, meta) ->
	  super("NodeFn", meta)

class SWY extends GrammarBase
	constructor: (@style, @where, @yield, meta) ->
	  super("SWY", meta)

module.exports =
	FragFn:			FragFn
	FFAction:		FFAction
	FFCaseTree:	FFCaseTree
	FFNodeDef:	FFNodeDef
	FFNodeFn:		FFNodeFn
	SWY:				SWY
	
