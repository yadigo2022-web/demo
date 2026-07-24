package com.example.controller;

import java.util.List;

public class AnalysisRequest {

    private double damping;
    private List<Double> mass;
    private List<Double> stiffness;
    private String earthquake;
    private String fileName;
    private String csvText;

    // damping
    public double getDamping() {
        return damping;
    }

    public void setDamping(double damping) {
        this.damping = damping;
    }

    // mass
    public List<Double> getMass() {
        return mass;
    }

    public void setMass(List<Double> mass) {
        this.mass = mass;
    }

    // stiffness
    public List<Double> getStiffness() {
        return stiffness;
    }

    public void setStiffness(List<Double> stiffness) {
        this.stiffness = stiffness;
    }

    // earthquake
    public String getEarthquake() {
        return earthquake;
    }

    public void setEarthquake(String earthquake) {
        this.earthquake = earthquake;
    }

    // fileName
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    // csvText
    public String getCsvText() {
        return csvText;
    }

    public void setCsvText(String csvText) {
        this.csvText = csvText;
    }
}