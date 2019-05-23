import {tiny, defs} from './common.js';
                                                  // Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;
import { Axes_Viewer, Axes_Viewer_Test_Scene } 
  from "./axes-viewer.js"
import { Inertia_Demo, Collision_Demo }
  from "./collisions-demo.js"
import { Many_Lights_Demo }
  from "./many-lights-demo.js"
import { Obj_File_Demo }
  from "./obj-file-demo.js"
import { Scene_To_Texture_Demo }
  from "./scene-to-texture-demo.js"
import { Text_Demo }
  from "./text-demo.js"  
import { Transforms_Sandbox }
  from './transforms-sandbox.js';


export class Surfaces_Demo extends Scene
{ constructor( scene_id )
    { super();
      this.scene_id = scene_id;

      if( typeof( scene_id ) === "undefined" )
        this.test_scene = new Surfaces_Demo( 0 );
      else
        this[ [ "scene_0" ][ this.scene_id ] ] ();
    }
  scene_0()
    { const row_operation = (i,p) => p ? Mat4.translation([ 0,-1,0 ]).times(p.to4(1)).to3() : Vec.of( -1,-1,0 );
      const column_operation = (j,p) => Mat4.translation([ 1,0,0 ]).times(p.to4(1)).to3();
      this.shapes = { sheet: new defs.Grid_Patch( 10, 10, row_operation, column_operation ) };

      const textured = new defs.Textured_Phong( 1 );
      this.material = new Material( textured, { ambient: .5, texture: new Texture( "assets/rgb.jpg" ) } );
    }
  scene_0_display( context, program_state )
    { this.shapes.sheet.draw( context, program_state, Mat4.identity(), this.material );
    }
  show_explanation( document_element, webgl_manager )
    { if( typeof( this.scene_id ) != "undefined" )
        return;

      document_element.style.padding = 0;
      document_element.style.width = "1080px";
      document_element.style.overflowY = "hidden";

      const element_1 = document_element.appendChild( document.createElement( "div" ) );
      element_1.className = "canvas-widget";

      const cw = new tiny.Canvas_Widget( element_1, undefined, { make_controls: 0 } );
      cw.webgl_manager.scenes.push( this.test_scene );
      cw.webgl_manager.program_state = webgl_manager.program_state;
      cw.webgl_manager.set_size( [ 1080,300 ] )

      const element_2 = document_element.appendChild( document.createElement( "div" ) );
      element_2.className = "code-widget";

      const code = new tiny.Code_Widget( element_2, Surfaces_Demo.prototype.scene_1, [], defs, { hide_navigator: 1 } ); 
    }
  display( context, program_state )
    { if( !context.scratchpad.controls ) 
        { this.children.push( context.scratchpad.controls = new defs.Movement_Controls() );
          program_state.set_camera( Mat4.translation([ 0,0,-10 ]) );
        }
      program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 ); 

                                                // *** Lights: *** Values of vector or point lights.  They'll be consulted by 
                                                // the shader when coloring shapes.  See Light's class definition for inputs.
      const t = this.t = program_state.animation_time/1000;
      const angle = Math.sin( t );
      const light_position = Mat4.rotation( angle, [ 1,0,0 ] ).times( Vec.of( 0,-1,1,0 ) );
      program_state.lights = [ new Light( light_position, Color.of( 1,1,1,1 ), 1000000 ) ];   


      if( typeof( scene_id ) != "undefined" )
        this[ [ "scene_0_display" ][ this.scene_id ] ] ();
    }
}
  
export class Nesting_Test extends Transforms_Sandbox
  { constructor()
      { super();
        
        this.test_scene = new Surfaces_Demo( 0 );
      }
    show_explanation( document_element, webgl_manager )
      { document_element.style.padding = 0;
        document_element.style.width = "1080px";
        document_element.style.overflowY = "hidden";

        const element_1 = document_element.appendChild( document.createElement( "div" ) );
        element_1.className = "canvas-widget";

        const cw = new tiny.Canvas_Widget( element_1, undefined, { make_controls: 0 } );
        cw.webgl_manager.scenes.push( this.test_scene );
        cw.webgl_manager.program_state = webgl_manager.program_state;
        cw.webgl_manager.set_size( [ 1080,300 ] )

        const element_2 = document_element.appendChild( document.createElement( "div" ) );
        element_2.className = "code-widget";

        const code = new tiny.Code_Widget( element_2, Surfaces_Demo.prototype.scene_1, [], defs, { hide_navigator: 1 } ); 
      }
    display( context, program_state )
      { program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 );
        super.display( context, program_state );
      }
  }