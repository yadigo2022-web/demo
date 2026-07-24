package com.example.controller;

import java.util.List;

public class AnalysisResult {

    private List<Double> acc;
    private List<Double> vel;
    private List<Double> disp;
    private List<Double> groundAcc;


    public AnalysisResult(
            List<Double> acc,
            List<Double> vel,
            List<Double> disp,
            List<Double> groundAcc
    ) {

        this.acc = acc;
        this.vel = vel;
        this.disp = disp;
        this.groundAcc = groundAcc;

    }


    public List<Double> getAcc() {
        return acc;
    }

    public List<Double> getVel() {
        return vel;
    }

    public List<Double> getDisp() {
        return disp;
    }

    public List<Double> getGroundAcc() {
        return groundAcc;
    }

}