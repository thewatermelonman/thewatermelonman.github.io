export const shader_text = `

        uniform float thickness;

			varying vec3 vCenter;
            uniform vec3 color_1;
            uniform vec3 color_2;

			void main() {

				vec3 afwidth = fwidth( vCenter.xyz );

				vec3 edge3 = smoothstep( ( thickness - 0.5 ) * afwidth, (thickness + 0.5) * afwidth, vCenter.xyz );

				float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );

				gl_FragColor.rgb = edge < 1.0 ? color_2 : color_1;
				gl_FragColor.a = 1.0;

			}

`;