/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect } from 'react';
import { SimulationConfig, GlobalSettings, Ball, Vector2 } from '../types';
import { generatePolygon, generateStar, add, mult, dot, sub, normalize, mag } from '../utils/math';

interface CanvasProps {
  config: SimulationConfig;
  globalSettings: GlobalSettings;
}

const Canvas: React.FC<CanvasProps> = ({ config, globalSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef<{
    balls: Ball[];
    rotation: number;
  }>({
    balls: [],
    rotation: 0,
  });

  // Initialize Simulation
  useEffect(() => {
    const balls: Ball[] = [];
    const count = Math.floor(config.ballCount * 1);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30;
      const speed = config.initialSpeed * (0.5 + Math.random());
      const velAngle = Math.random() * Math.PI * 2;

      balls.push({
        id: `${config.id}-${i}`,
        pos: { x: 0 + Math.cos(angle) * dist, y: 0 + Math.sin(angle) * dist },
        vel: { x: Math.cos(velAngle) * speed, y: Math.sin(velAngle) * speed },
        radius: config.ballSize,
        color: '#FACC15',
        angle: Math.random() * Math.PI * 2,
        angularVel: (Math.random() - 0.5) * 0.2,
      });
    }

    stateRef.current = {
      balls,
      rotation: 0,
    };
  }, [config.id, config.ballCount, config.initialSpeed, config.ballSize]);

  const updatePhysics = (width: number, height: number) => {
    const state = stateRef.current;
    const { gravityMultiplier, timeScale, rotationMultiplier, bouncinessMultiplier } = globalSettings;
    
    // 1. Update Shape Rotation
    state.rotation += config.rotationSpeed * rotationMultiplier * timeScale;
    
    const shapeRadius = Math.min(width, height) * 0.45;

    // 2. Generate Shape Vertices (Local Space)
    let localVertices: Vector2[] = [];
    if (config.shapeType === 'star') {
         localVertices = generateStar(config.vertexCount || 5, shapeRadius, shapeRadius * 0.4, {x:0,y:0}, state.rotation);
    } else {
         localVertices = generatePolygon(config.vertexCount || 4, shapeRadius, {x:0,y:0}, state.rotation);
    }

    // 3. Update Balls
    state.balls.forEach(ball => {
        // Apply Gravity
        ball.vel.y += config.gravity * gravityMultiplier * timeScale;
        
        // Air Resistance (Linear & Angular)
        const airFriction = 1 - (config.friction * timeScale);
        ball.vel = mult(ball.vel, airFriction);
        ball.angularVel *= Math.pow(0.99, timeScale); // Decay spin slightly

        // Integration
        ball.pos = add(ball.pos, mult(ball.vel, timeScale));
        ball.angle += ball.angularVel * timeScale;

        // Collision with Walls
        const restitution = config.restitution * bouncinessMultiplier;
        const wallFriction = 0.2; // Friction coeff for wall interaction
        
        for (let i = 0; i < localVertices.length; i++) {
            const p1 = localVertices[i];
            const p2 = localVertices[(i + 1) % localVertices.length];
            const edge = sub(p2, p1);
            
            // Calculate normal pointing inward
            const edgeNormal = normalize({ x: -edge.y, y: edge.x }); 
            if (dot(edgeNormal, mult(p1, -1)) < 0) {
                edgeNormal.x *= -1;
                edgeNormal.y *= -1;
            }

            const relPos = sub(ball.pos, p1);
            const dist = dot(relPos, edgeNormal);
            
            if (dist < ball.radius) {
                // Position correction
                const penetration = ball.radius - dist;
                ball.pos = add(ball.pos, mult(edgeNormal, penetration));

                // Relative velocity at contact point
                // v_rel = v_ball - v_wall (wall is static here roughly)
                const vNormal = dot(ball.vel, edgeNormal);

                if (vNormal < 0) {
                    // Standard Reflection
                    const reflect = mult(edgeNormal, 2 * vNormal);
                    ball.vel = sub(ball.vel, mult(reflect, 1));
                    ball.vel = mult(ball.vel, restitution);
                    
                    // --- Friction & Spin Physics ---
                    const tangent = { x: -edgeNormal.y, y: edgeNormal.x };
                    const vTan = dot(ball.vel, tangent);
                    
                    // Surface velocity at contact point: v_surf = v_tan + (angularVel * radius)
                    // Note: This sign depends on coordinate system. 
                    // If moving "right" (positive tangent) and spinning "CW" (positive angle), bottom moves left.
                    // Let's assume standard: v_surf = vTan + ball.angularVel * ball.radius;
                    
                    const vSurf = vTan + ball.angularVel * ball.radius;

                    // Apply friction impulse opposite to surface velocity
                    const frictionImpulse = -vSurf * wallFriction;
                    
                    // Update linear velocity along tangent
                    ball.vel = add(ball.vel, mult(tangent, frictionImpulse * 0.5));

                    // Update angular velocity (Torque = r x F)
                    // Simplified: Impulse causes change in spin
                    ball.angularVel += (frictionImpulse * 2.5) / ball.radius; 
                    
                    // Push out slightly to prevent sticking
                    ball.vel = add(ball.vel, mult(edgeNormal, 0.1));
                }
            }
        }
    });

    // 4. Ball-to-Ball Collisions
    const balls = state.balls;
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ballA = balls[i];
            const ballB = balls[j];

            const distVec = sub(ballB.pos, ballA.pos);
            const distance = mag(distVec);
            const totalRadius = ballA.radius + ballB.radius;

            if (distance < totalRadius) {
                // Collision Normal
                const n = distance === 0 ? {x: 1, y: 0} : normalize(distVec);
                const t = { x: -n.y, y: n.x };

                // Position Correction
                const overlap = totalRadius - distance;
                const correction = mult(n, overlap * 0.5);
                ballA.pos = sub(ballA.pos, correction);
                ballB.pos = add(ballB.pos, correction);

                // Relative Velocity
                const relVel = sub(ballB.vel, ballA.vel);
                const velAlongNormal = dot(relVel, n);

                if (velAlongNormal < 0) {
                    // Elastic Collision
                    const jN = -(1 + 0.9) * velAlongNormal; // 0.9 is restitution
                    const impulse = mult(n, jN * 0.5); // 0.5 for equal mass

                    ballA.vel = sub(ballA.vel, impulse);
                    ballB.vel = add(ballB.vel, impulse);

                    // Angular Friction Transfer
                    // When balls touch, they rub against each other.
                    // v_rel_surf = (vB_tan + wB*r) - (vA_tan + wA*r) roughly
                    // Simple heuristic: Try to equalize/transfer angular velocity
                    const friction = 0.1;
                    const diffW = ballB.angularVel - ballA.angularVel;
                    // Transfer spin
                    const transfer = diffW * friction;
                    ballA.angularVel += transfer;
                    ballB.angularVel -= transfer;
                    
                    // Also affect tangent velocity based on spin difference (Magnus-like kick)
                    // This adds chaos
                    const kick = mult(t, diffW * ballA.radius * 0.05);
                    ballA.vel = add(ballA.vel, kick);
                    ballB.vel = sub(ballB.vel, kick);
                }
            }
        }
    }

    // Final check
    balls.forEach(ball => {
      if (mag(ball.pos) > shapeRadius + 100) {
           ball.pos = {x: 0, y: 0};
           ball.vel = {x: 0, y: 0};
           ball.angularVel = 0;
      }
    });
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const center = { x: width / 2, y: height / 2 };
    const state = stateRef.current;
    const shapeRadius = Math.min(width, height) * 0.45;

    // Draw Shape
    let points: Vector2[] = [];
    if (config.shapeType === 'star') {
         points = generateStar(config.vertexCount || 5, shapeRadius, shapeRadius * 0.4, center, state.rotation);
    } else {
         points = generatePolygon(config.vertexCount || 4, shapeRadius, center, state.rotation);
    }

    ctx.beginPath();
    if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
    }
    
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
    ctx.fill();

    // Draw Balls
    state.balls.forEach(ball => {
        const screenX = center.x + ball.pos.x;
        const screenY = center.y + ball.pos.y;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(ball.angle);

        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Rotation Indicator (Cross)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.5;
        // Line from center to edge
        ctx.moveTo(0, 0);
        ctx.lineTo(ball.radius * 0.8, 0);
        // Perpendicular small line
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ball.radius * 0.5);
        ctx.stroke();

        ctx.restore();
    });
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientWidth, clientHeight } = canvas;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
    }

    updatePhysics(canvas.width, canvas.height);
    draw(ctx, canvas.width, canvas.height);
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSettings]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default Canvas;