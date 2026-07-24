package com.example.controller;

import java.util.List;

public class TotalDispResult {

    private List<List<Double>> totalDispData;

    public TotalDispResult(List<List<Double>> totalDispData) {
        this.totalDispData = totalDispData;
    }

    public List<List<Double>> getTotalDispData() {
        return totalDispData;
    }
}
