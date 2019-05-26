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
{ constructor( scene_id, material )
    { super();

      if( typeof( scene_id ) === "undefined" )
        { this.is_master = true;
          this.sections = [];
        }

      this.num_scenes = 3;
      
      this.scene_id = scene_id;
      this.material = material;
      
      if( this.is_master )
      {
        const textured = new defs.Textured_Phong( 1 );
        this.material = new Material( textured, { ambient: .5, texture: new Texture( "assets/rgb.jpg" ) } );

        for( let i = 0; i < this.num_scenes; i++ )
          this.sections.push( new Surfaces_Demo( i, this.material ) );
      }
      else
        this[ "construct_scene_" + scene_id ] ();
    }
  construct_scene_0()
    { const initial_corner_point = Vec.of( -1,-1,0 );
      const row_operation = (i,p) => p ? Mat4.translation([ 0,.2,0 ]).times(p.to4(1)).to3() 
                                       : initial_corner_point;
      const column_operation = (j,p) => Mat4.translation([ .2,0,0 ]).times(p.to4(1)).to3();

      const row_operation_2    = (i,p)   => Vec.of(   0,2*i-1,Math.random() );
      const column_operation_2 = (j,p,i) => Vec.of( 2*j-1,2*i-1,Math.random() );

      this.shapes = { sheet : new defs.Grid_Patch( 10, 10, row_operation, column_operation ),
                      sheet2: new defs.Grid_Patch( 10, 10, row_operation_2, column_operation_2 ) };      
    }
  construct_scene_1()
    { const initial_corner_point = Vec.of( -1,-1,0 );
      const row_operation = (i,p) => p ? Mat4.translation([ 0,.2,0 ]).times(p.to4(1)).to3() 
                                       : initial_corner_point;
      const column_operation = (j,p) => Mat4.translation([ .2,0,0 ]).times(p.to4(1)).to3();
      this.shapes = { sheet : new defs.Grid_Patch( 10, 10, row_operation, column_operation ) };
    }
  construct_scene_2()
    { const initial_corner_point = Vec.of( -1,-1,0 );
      const row_operation = (i,p) => p ? Mat4.translation([ 0,.2,0 ]).times(p.to4(1)).to3() 
                                       : initial_corner_point;
      const column_operation = (j,p) => Mat4.translation([ .2,0,0 ]).times(p.to4(1)).to3();
      this.shapes = { sheet : new defs.Grid_Patch( 10, 10, row_operation, column_operation ),
                      sheet2: new defs.Grid_Patch( 10, 10, row_operation, column_operation ) };

      this.shapes.sheet2.arrays.position.forEach( (p,i,a) => 
                      a[i] = p.plus( Vec.of( Math.random(), 0, Math.random() ) ) );
    }
  display_scene_0( context, program_state )
    { 
      if( !context.scratchpad.controls ) 
        { this.children.push( context.scratchpad.controls = new defs.Movement_Controls() );
          program_state.set_camera( Mat4.translation([ 0,0,-3 ]) );
        }

      const r = Mat4.rotation( Math.PI, [ 0,1,0 ] );
      this.shapes.sheet .draw( context, program_state, Mat4.translation([ -1.5,0,0]).times(r), this.material );
      this.shapes.sheet2.draw( context, program_state, Mat4.translation([  1.5,0,0]).times(r), this.material );
    }
  display_scene_1( context, program_state )
    { 
      this.shapes.sheet.arrays.position.forEach( (p,i,a) => 
                      a[i] = p.plus( Vec.of( 0, 0, .02*Math.random()-.01 ) ) );

      this.shapes.sheet.flat_shade();

      this.shapes.sheet.draw( context, program_state, Mat4.identity(), this.material );

// Warning:  You can't call this until you've already drawn the shape once.
      
      this.shapes.sheet.copy_onto_graphics_card( context.context, ["position","normal"], false );      
    }
  display_scene_2( context, program_state )
    { this.shapes.sheet.draw( context, program_state, Mat4.identity(), this.material );
    }
  explain_scene_0( document_element )
    { document_element.innerHTML += `<p>Parametric Surfaces can be generated by parametric functions that are driven by changes to two variables - s and t.  As either s or t increase, we can step along the shape's surface in some direction aligned with the shape, not the usual X,Y,Z axes.</p>
                                     <p>Grid_Patch is a generalized parametric surface.  It is always made of a sheet of squares arranged in rows and columns, corresponding to s and t.  The sheets are always guaranteed to have this row/column arrangement, but where it goes as you follow an edge to the next row or column over could vary.  When generating the shape below, we told it to do the most obvious thing whenever s or t increase; just increase X and Y.  A flat rectangle results.</p>
                                     <p>The shape on the right is the same except </p>`;
    }
  explain_scene_1( document_element )
    { document_element.innerHTML += `<p>This demo lets random initial momentums carry bodies until they fall and bounce.  It shows a good way to do incremental movements, which are crucial for making objects look like they're moving on their own instead of following a pre-determined path.  Animated objects look more real when they have inertia and obey physical laws, instead of being driven by simple sinusoids or periodic functions.
                                     </p><p>For each moving object, we need to store a model matrix somewhere that is permanent (such as inside of our class) so we can keep consulting it every frame.  As an example, for a bowling simulation, the ball and each pin would go into an array (including 11 total matrices).  We give the model transform matrix a \"velocity\" and track it over time, which is split up into linear and angular components.  Here the angular velocity is expressed as an Euler angle-axis pair so that we can scale the angular speed how we want it.
                                     </p><p>The forward Euler method is used to advance the linear and angular velocities of each shape one time-step.  The velocities are not subject to any forces here, but just a downward acceleration.  Velocities are also constrained to not take any objects under the ground plane.
                                     </p><p>This scene extends class Simulation, which carefully manages stepping simulation time for any scenes that subclass it.  It totally decouples the whole simulation from the frame rate, following the suggestions in the blog post <a href=\"https://gafferongames.com/post/fix_your_timestep/\" target=\"blank\">\"Fix Your Timestep\"</a> by Glenn Fielder.  Buttons allow you to speed up and slow down time to show that the simulation's answers do not change.</p>`;
    }
  explain_scene_2( document_element )
    { document_element.innerHTML += `<p>This demo lets random initial momentums carry bodies until they fall and bounce.  It shows a good way to do incremental movements, which are crucial for making objects look like they're moving on their own instead of following a pre-determined path.  Animated objects look more real when they have inertia and obey physical laws, instead of being driven by simple sinusoids or periodic functions.
                                     </p><p>For each moving object, we need to store a model matrix somewhere that is permanent (such as inside of our class) so we can keep consulting it every frame.  As an example, for a bowling simulation, the ball and each pin would go into an array (including 11 total matrices).  We give the model transform matrix a \"velocity\" and track it over time, which is split up into linear and angular components.  Here the angular velocity is expressed as an Euler angle-axis pair so that we can scale the angular speed how we want it.
                                     </p><p>The forward Euler method is used to advance the linear and angular velocities of each shape one time-step.  The velocities are not subject to any forces here, but just a downward acceleration.  Velocities are also constrained to not take any objects under the ground plane.
                                     </p><p>This scene extends class Simulation, which carefully manages stepping simulation time for any scenes that subclass it.  It totally decouples the whole simulation from the frame rate, following the suggestions in the blog post <a href=\"https://gafferongames.com/post/fix_your_timestep/\" target=\"blank\">\"Fix Your Timestep\"</a> by Glenn Fielder.  Buttons allow you to speed up and slow down time to show that the simulation's answers do not change.</p>`;
    }
  show_explanation( document_element, webgl_manager )
    { if( this.is_master )
        {
          document_element.style.padding = 0;
          document_element.style.width = "1080px";
          document_element.style.overflowY = "hidden";

          for( let i = 0; i < this.num_scenes; i++ )
            {
              const element_1 = document_element.appendChild( document.createElement( "div" ) );
              element_1.className = "canvas-widget";

              const cw = new tiny.Canvas_Widget( element_1, undefined, { make_controls: i==0 } );
              cw.webgl_manager.scenes.push( this.sections[ i ] );
              cw.webgl_manager.program_state = webgl_manager.program_state;
              cw.webgl_manager.set_size( [ 1080,300 ] )

              const element_2 = document_element.appendChild( document.createElement( "div" ) );
              element_2.className = "code-widget";

              const code = new tiny.Code_Widget( element_2, 
                                 Surfaces_Demo.prototype[ "display_scene_"+i ],
                                 [], defs, { hide_navigator: 1 } );
            }

            const final_text = document_element.appendChild( document.createElement( "div" ) );
            final_text.innerHTML = `<p>That's all the examples.  Below is the code that generates this whole multi-part tutorial:</p>`;          
         }
       else
         this[ "explain_scene_" + this.scene_id ] ( document_element );
    }
  display( context, program_state )
    { 
      program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 ); 

      if( this.is_master )
        { context.canvas.style.display = "none";
          
                                                    // *** Lights: *** Values of vector or point lights.  They'll be consulted by 
                                                    // the shader when coloring shapes.  See Light's class definition for inputs.
          const t = this.t = program_state.animation_time/1000;
          const angle = Math.sin( t );
          const light_position = Mat4.rotation( angle, [ 1,0,0 ] ).times( Vec.of( 0,-1,1,0 ) );
          program_state.lights = [ new Light( light_position, Color.of( 1,1,1,1 ), 1000000 ) ];   
        }
      else
        this[ "display_scene_" + this.scene_id ] ( context, program_state );
    }
}
  
// export class Nesting_Test extends Transforms_Sandbox
//   { constructor()
//       { super();
        
//         this.test_scene = new Surfaces_Demo( 0 );
//       }
//     show_explanation( document_element, webgl_manager )
//       { document_element.style.padding = 0;
//         document_element.style.width = "1080px";
//         document_element.style.overflowY = "hidden";

//         const element_1 = document_element.appendChild( document.createElement( "div" ) );
//         element_1.className = "canvas-widget";

//         const cw = new tiny.Canvas_Widget( element_1, undefined, { make_controls: 0 } );
//         cw.webgl_manager.scenes.push( this.test_scene );
//         cw.webgl_manager.program_state = webgl_manager.program_state;
//         cw.webgl_manager.set_size( [ 1080,300 ] )

//         const element_2 = document_element.appendChild( document.createElement( "div" ) );
//         element_2.className = "code-widget";

//         const code = new tiny.Code_Widget( element_2, Surfaces_Demo.prototype.scene_1, [], defs, { hide_navigator: 1 } ); 
//       }
//     display( context, program_state )
//       { program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 100 );
//         super.display( context, program_state );
//       }
//   }