enum Patrol{
    //% block="□□"
    white_white = 1,
    //% block="□■"
    white_black = 2,
    //% block="■□"
    black_white = 3,
    //% block="■■"
    black_black = 4
}
enum PingUnit {
    //% block="cm"
    Centimeters,
    //% block="μs"
    MicroSeconds
}
enum IRList {
    //% block="FRONT"
    front = 1,
    //% block="LEFT"
    right = 2,
    //% block="RIGHT"
    left = 3
}
enum BeatList {
    //% block="1"
    whole_beat = 10,
    //% block="1/2"
    half_beat = 11,
    //% block="1/4"
    quarter_beat = 12,
    //% block="1/8"
    eighth_beat = 13,
    //% block="2"
    double_beat = 14,
    //% block="4"
    breve_beat = 15
}
enum ToneHzTable {
    do = 262,
    re = 294,
    mi = 330,
    fa = 349,
    sol = 392,
    la = 440,
    si = 494
}
enum ColorList {
    //% block="ORANGE"
    orange = 2,
    //% block="YELLOW"
    yellow = 3,
    //% block="GREEN"
    green = 4,
    //% block="BLUE"
    blue = 5,
    //% block="INDIGO"
    indigo = 6,
    //% block="VIOLET"
    violet = 7,
    //% block="PURPLE"
    purple = 8,
    //% block="WHITE"
    white = 9,
    //% block="BLOCK"
    black = 1
}

//% weight=100 color=#1B80C4 icon=""
namespace MiniCruise {
	let neoStrip = neopixel.create(DigitalPin.P1, 9, NeoPixelMode.RGB);
    /**
     * 设置电机
     */
	//% blockId="mini_cruise_motor" block="Set DC Motor Left Speed%leftSpeed| Right Speed%rightSpeed| for%time"
    //% leftSpeed.min=-1023 leftSpeed.max=1023
    //% rightSpeed.min=-1023 rightSpeed.max=1023
    //% weight=100
    export function motorRun(leftSpeed: number, rightSpeed: number, time: number): void {
        let leftRotation = 1;
        if(leftSpeed < 0){
            leftRotation = 0;
        }
        let rightRotation = 1;
        if(rightSpeed < 0){
            rightRotation = 0;
        }
       //左电机 M1
        pins.analogWritePin(AnalogPin.P14, Math.abs(leftSpeed));
        pins.digitalWritePin(DigitalPin.P13, leftRotation);
        //右电机 M2
        pins.analogWritePin(AnalogPin.P16, Math.abs(rightSpeed));
        pins.digitalWritePin(DigitalPin.P15, rightRotation);
        //添加时间控制
        if(time < 0){
            time = 0;
        }
        let time_num = time*1000000;
        control.waitMicros(time_num);
        //左电机 M1
        pins.analogWritePin(AnalogPin.P14, 0);
        pins.digitalWritePin(DigitalPin.P13, 0);
        //右电机 M2
        pins.analogWritePin(AnalogPin.P16, 0);
        pins.digitalWritePin(DigitalPin.P15, 0);
    }
	/**
     * 播放音调
     */
    //% weight=89
    //% blockId="mini_cruise_tone" block="Play Tone %tone| for %beatInfo"
    export function myPlayTone(tone:ToneHzTable, beatInfo:BeatList): void {
        if(beatInfo == BeatList.whole_beat){
            music.playTone(tone, music.beat(BeatFraction.Whole));

        }    
        if(beatInfo == BeatList.half_beat){
            music.playTone(tone, music.beat(BeatFraction.Half));

        }        
        if(beatInfo == BeatList.quarter_beat){
            music.playTone(tone, music.beat(BeatFraction.Quarter));

        }
        if(beatInfo == BeatList.double_beat){
            music.playTone(tone, music.beat(BeatFraction.Double));

        }    
        if(beatInfo == BeatList.eighth_beat){
            music.playTone(tone, music.beat(BeatFraction.Eighth));

        }
        if(beatInfo == BeatList.breve_beat){
            music.playTone(tone, music.beat(BeatFraction.Breve));

        }   
    }
	//% weight=79
    //% blockId="mini_cruise_patrol" block="Line Tracer Detects %patrol"
    export function readPatrol(patrol:Patrol): boolean {
        // let p1 = pins.digitalReadPin(DigitalPin.P12);
        // let p2 = pins.digitalReadPin(DigitalPin.P11);
        if(patrol == Patrol.white_white){
            if(pins.digitalReadPin(DigitalPin.P12) == 1 && pins.digitalReadPin(DigitalPin.P11) == 1){
                return true;
            }else{
                return false;
            }
        }else if(patrol == Patrol.white_black){
            if(pins.digitalReadPin(DigitalPin.P12) == 1 && pins.digitalReadPin(DigitalPin.P11) == 0){
                return true;
            }else{
                return false;
            }
        }else if(patrol == Patrol.black_white){
            if(pins.digitalReadPin(DigitalPin.P12) == 0 && pins.digitalReadPin(DigitalPin.P11) == 1){
                return true;
            }else{
                return false;
            }
        }else if(patrol == Patrol.black_black){
            if(pins.digitalReadPin(DigitalPin.P12) == 0 && pins.digitalReadPin(DigitalPin.P11) == 0){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
	//% blockId=mini_cruise_sensor block="Ultrasonic Distance %unit"
    //% weight=69
    export function sensorDistance(unit: PingUnit, maxCmDistance = 500): number {
         pins.setPull(DigitalPin.P2, PinPullMode.PullNone);
         pins.digitalWritePin(DigitalPin.P2, 0);
         control.waitMicros(2);
         pins.digitalWritePin(DigitalPin.P2, 1);
         control.waitMicros(10);
         pins.digitalWritePin(DigitalPin.P2, 0);
         // read pulse
         const d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58);
         switch (unit) {
             case PingUnit.Centimeters: return Math.idiv(d, 58);
             default: return d ;
        }
    }
	/**
      * 红外线探测左、前、右是否有障碍物
      */
    //% blockId="mini_cruise_IR" block="%IRDire| Obstacle"
    //% weight=68
    export function cruiseIR(IRDire:IRList): boolean {
        if(IRDire == IRList.front){
            if(pins.digitalReadPin(DigitalPin.P5) == 0){
                return true;
            }else{
                return false;
            }
        }else if(IRDire == IRList.left){
            if(pins.digitalReadPin(DigitalPin.P8) == 0){
                return true;
            }else{
                return false;
            }
        }else if(IRDire == IRList.right){
            if(pins.digitalReadPin(DigitalPin.P2) == 0){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
	//% blockId=cruise_rgb block="Set LED %RgbValue| Colour %ColorValue"
    //% weight=59
    export function setRGB(RgbValue: RgbList, ColorValue:ColorList): void {
        //if(ColorValue == ColorList.red){
        //    if(RgbValue == RgbList.rgb){
        //        neoStrip.showColor(neopixel.colors(NeoPixelColors.Red));
        //    }else{
        //        neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Red));
        //    }
        //    
        //}
        if(ColorValue == ColorList.orange){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Orange));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Orange));
            }
        }
        if(ColorValue == ColorList.yellow){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Yellow));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Yellow));
            }
        }
        if(ColorValue == ColorList.green){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Green));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Green));
            }
        }
        if(ColorValue == ColorList.blue){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Blue));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Blue));
            }
        }
        if(ColorValue == ColorList.indigo){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Indigo));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Indigo));
            }
        }
        if(ColorValue == ColorList.violet){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Violet));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Violet));
            }
        }
        if(ColorValue == ColorList.purple){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Purple));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Purple));
            }
        }
        if(ColorValue == ColorList.white){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.White));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.White));
            }
        }
        if(ColorValue == ColorList.black){
            if(RgbValue == RgbList.rgb){
                neoStrip.showColor(neopixel.colors(NeoPixelColors.Black));
            }else{
                neoStrip.setPixelColor(RgbValue, neopixel.colors(NeoPixelColors.Black));
            }
        }
        neoStrip.show();
    }
	/**
     * Clear leds.
     */
    //% blockId="cruise_neo_clear" block="Clear all"
    //% weight=55
    export function neoClear(): void {
        neoStrip.showColor(neopixel.colors(NeoPixelColors.Black));
    }
}
