var _ = require('underscore'),
	bytes = require('bytes'),
	React = require('react'),
	Field = require('../Field');

var ICON_EXTS = [
	'aac', 'ai', 'aiff', 'avi', 'bmp', 'c', 'cpp', 'css', 'dat', 'dmg', 'doc', 'dotx', 'dwg', 'dxf', 'eps', 'exe', 'flv', 'gif', 'h',
	'hpp', 'html', 'ics', 'iso', 'java', 'jpg', 'js', 'key', 'less', 'mid', 'mp3', 'mp4', 'mpg', 'odf', 'ods', 'odt', 'otp', 'ots',
	'ott', 'pdf', 'php', 'png', 'ppt', 'psd', 'py', 'qt', 'rar', 'rb', 'rtf', 'sass', 'scss', 'sql', 'tga', 'tgz', 'tiff', 'txt',
	'wav', 'xls', 'xlsx', 'xml', 'yml', 'zip'
];

var Group = React.createClass({
	
	render: function () {
		// console.log(this.props)

		var body = [];
		var images = this.props.images.map(function(img, index) {
			var itemClassName = 'file-item';
			var filename = img.filename;
			var ext = filename.split('.').pop();
			var iconName = '_blank';
			if (_.contains(ICON_EXTS, ext)) iconName = ext;

			if (img.size) {
				var size = (<span className='file-size'>{bytes(img.size)}</span>);
			}

			// var deletebtn = (<span className='file-note-delete'>save to delete</span>);
			// var queuedbtn = (<span className='file-note-upload'>save to upload</span>);

			return (
				<div className={itemClassName} key={index}>
					<img className='file-icon' src={'/keystone/images/icons/32/' + iconName + '.png'} />
					<span className='file-filename'>{filename}</span>
					{size}
				</div>
			)			
		})
		// for (var i = 0; i < this.props.images.length; i++) {
		// 	var img = this.props.images[i]
		// 	var filename = img.filename;
		// 	var ext = filename.split('.').pop();

		// 	var iconName = '_blank';
		// 	if (_.contains(ICON_EXTS, ext)) iconName = ext;

		// 	images.push(<img className='file-icon' src={'/keystone/images/icons/32/' + iconName + '.png'} />);
		// 	images.push(<span className='file-filename'>{img.filename}</span>);
		// 	if (this.props.size) {
		// 		images.push(<span className='file-size'>{bytes(img.size)}</span>);
		// 	}

		// 	if (img.deleted) {
		// 		images.push(<span className='file-note-delete'>save to delete</span>);
		// 	} else if (img.isQueued) {
		// 		images.push(<span className='file-note-upload'>save to upload</span>);
		// 	}

		// 	if (!img.isQueued) {
		// 		var actionLabel = img.deleted ? 'undo' : 'remove';
		// 		images.push(<span className='file-action' onClick={img.toggleDelete}>{actionLabel}</span>);
		// 	}
		// }
		var groupClassName = 'group-item';
		if (this.props.deleted) groupClassName += ' group-item-deleted';
		// console.log(images)


		// return ;
		// console.log(images)
		return <div className={groupClassName} key={this.props.key}>{images}</div>;
	}
	
});

module.exports = Field.create({

	getInitialState: function () {
		var groups = [];
		var self = this;
		_.each(this.props.value, function (group, i) {
			self.pushItem(group, groups, i);
		});

		return { groups: groups };
	},

	removeItem: function (i) {
		var thumbs = this.state.items;
		var thumb = thumbs[i];

		if (thumb.props.isQueued) {
			thumbs[i] = null;
		} else {
			thumb.props.deleted = !thumb.props.deleted;
		}

		this.setState({ items: thumbs });
	},

	pushItem: function (args, group, index) {
		// args.toggleDelete = this.removeItem.bind(this, index);
		group.push(<Group key={index} {...args} />);
	},

	fileFieldNode: function () {
		return this.refs.fileField.getDOMNode();
	},

	renderFileField: function () {
		return <input ref='fileField' type='file' name={this.props.paths.upload} multiple className='field-upload' onChange={this.uploadFile} />;
	},

	clearFiles: function () {
		this.fileFieldNode().value = '';

		this.setState({
			items: this.state.items.filter(function (thumb) {
				return !thumb.props.isQueued;
			})
		});
	},

	uploadFile: function (event) {
		var self = this;

		var files = event.target.files;
		_.each(files, function (f) {
			self.pushItem({ isQueued: true, filename: f.name });
			self.forceUpdate();
		});
	},

	changeFiles: function () {
		this.fileFieldNode().click();
	},

	hasFiles: function () {
		return this.refs.fileField && this.fileFieldNode().value;
	},

	renderToolbar: function () {
		var clearFilesButton;
		if (this.hasFiles()) {
			clearFilesButton = <button type='button' className='btn btn-default btn-upload' onClick={this.clearFiles}>Clear uploads</button>;
		}

		return (
			<div className='files-toolbar row col-sm-3 col-md-12'>
				<div className='pull-left'>
					<button type='button' className='btn btn-default btn-upload' onClick={this.changeFiles}>Upload</button>
					{clearFilesButton}
				</div>
			</div>
		);
	},

	renderPlaceholder: function () {
		return (
			<div className='file-field file-upload row col-sm-3 col-md-12' onClick={this.changeFiles}>
				<div className='file-preview'>
					<span className='file-thumbnail'>
						<span className='file-dropzone' />
						<div className='ion-picture file-uploading' />
					</span>
				</div>

				<div className='file-details'>
					<span className='file-message'>Click to upload</span>
				</div>
			</div>
		);
	},

	renderContainer: function () {
		return (

			<div className="panel-group">
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">
							<a data-toggle="collapse" href="#collapse1">Group 1</a>
						</h4>
					</div>
					<div id="collapse1" className="panel-collapse collapse">
						<div className='files-container clearfix'>
							{this.state.items}
						</div>
						{this.renderToolbar()}
					</div>
				</div>
			</div>

			
		);
	},

	renderFieldAction: function () {
		var value = '';
		var remove = [];
		_.each(this.state.items, function (thumb) {
			if (thumb && thumb.props.deleted) remove.push(thumb.props._id);
		});
		if (remove.length) value = 'delete:' + remove.join(',');

		return <input ref="action" className="field-action" type="hidden" value={value} name={this.props.paths.action} />;
	},

	renderUploadsField: function () {
		return <input ref="uploads" className="field-uploads" type="hidden" name={this.props.paths.uploads} />;
	},

	renderUI: function () {
		return (
			<div className="field field-type-files">
				<label className="field-label">{this.props.label}</label>

				{this.renderFieldAction()}
				{this.renderUploadsField()}
				{this.renderFileField()}

				<div className="field-ui">
					{this.renderContainer()}
				</div>
			</div>
		);
	}
});
