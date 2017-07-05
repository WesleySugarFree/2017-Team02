﻿



( function() {

	CKEDITOR.plugins.add( 'image', {
		requires: 'dialog',
		// jscs:disable maximumLineLength
		lang: 'en,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		icons: 'image', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%
		init: function( editor ) {
			// Abort when Image2 is to be loaded since both plugins
			// share the same button, command, etc. names (#11222).
			if ( editor.plugins.image2 )
				return;

			var pluginName = 'image';

			// Register the dialog.
			if ( saveto == 'qiniu' ) {
				CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/qiniu_image.js' );
			} else {
				CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/image.js' );
			}

			var allowed = 'img[alt,!src]{border-style,border-width,float,height,margin,margin-bottom,margin-left,margin-right,margin-top,width}',
				required = 'img[alt,src]';

			if ( CKEDITOR.dialog.isTabEnabled( editor, pluginName, 'advanced' ) )
				allowed = 'img[alt,dir,id,lang,longdesc,!src,title]{*}(*)';

			// Register the command.
			editor.addCommand( pluginName, new CKEDITOR.dialogCommand( pluginName, {
				allowedContent: allowed,
				requiredContent: required,
				contentTransformations: [
					[ 'img{width}: sizeToStyle', 'img[width]: sizeToAttribute' ],
					[ 'img{float}: alignmentToStyle', 'img[align]: alignmentToAttribute' ]
				]
			} ) );

			// Register the toolbar button.
			editor.ui.addButton && editor.ui.addButton( 'Image', {
				label: editor.lang.common.image,
				command: pluginName,
				toolbar: 'insert,10'
			} );

			editor.on( 'doubleclick', function( evt ) {
				var element = evt.data.element;

				if ( element.is( 'img' ) && !element.data( 'cke-realelement' ) && !element.isReadOnly() )
					evt.data.dialog = 'image';
			} );

			// If the "menu" plugin is loaded, register the menu items.
			if ( editor.addMenuItems ) {
				editor.addMenuItems( {
					image: {
						label: editor.lang.image.menu,
						command: 'image',
						group: 'image'
					}
				} );
			}

			// If the "contextmenu" plugin is loaded, register the listeners.
			if ( editor.contextMenu ) {
				editor.contextMenu.addListener( function( element ) {
					if ( getSelectedImage( editor, element ) )
						return { image: CKEDITOR.TRISTATE_OFF };
				} );
			}
		},
		afterInit: function( editor ) {
			// Abort when Image2 is to be loaded since both plugins
			// share the same button, command, etc. names (#11222).
			if ( editor.plugins.image2 )
				return;

			// Customize the behavior of the alignment commands. (#7430)
			setupAlignCommand( 'left' );
			setupAlignCommand( 'right' );
			setupAlignCommand( 'center' );
			setupAlignCommand( 'block' );

			function setupAlignCommand( value ) {
				var command = editor.getCommand( 'justify' + value );
				if ( command ) {
					if ( value == 'left' || value == 'right' ) {
						command.on( 'exec', function( evt ) {
							var img = getSelectedImage( editor ),
								align;
							if ( img ) {
								align = getImageAlignment( img );
								if ( align == value ) {
									img.removeStyle( 'float' );

									// Remove "align" attribute when necessary.
									if ( value == getImageAlignment( img ) )
										img.removeAttribute( 'align' );
								} else {
									img.setStyle( 'float', value );
								}

								evt.cancel();
							}
						} );
					}

					command.on( 'refresh', function( evt ) {
						var img = getSelectedImage( editor ),
							align;
						if ( img ) {
							align = getImageAlignment( img );

							this.setState(
							( align == value ) ? CKEDITOR.TRISTATE_ON : ( value == 'right' || value == 'left' ) ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED );

							evt.cancel();
						}
					} );
				}
			}
		}
	} );

	function getSelectedImage( editor, element ) {
		if ( !element ) {
			var sel = editor.getSelection();
			element = sel.getSelectedElement();
		}

		if ( element && element.is( 'img' ) && !element.data( 'cke-realelement' ) && !element.isReadOnly() )
			return element;
	}

	function getImageAlignment( element ) {
		var align = element.getStyle( 'float' );

		if ( align == 'inherit' || align == 'none' )
			align = 0;

		if ( !align )
			align = element.getAttribute( 'align' );

		return align;
	}

} )();




CKEDITOR.config.image_removeLinkByEmptyURL = true;


