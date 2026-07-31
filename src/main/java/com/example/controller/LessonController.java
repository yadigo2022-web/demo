package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LessonController {

    private final AnalysisService analysisService;

    public LessonController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // トップページ
    @GetMapping("/index")
    public String index() {
        return "index";
    }

    // ヘルプ画面
    @GetMapping("/help")
    public String help() {
        return "help";
    }

    // 解析
    @PostMapping("/analysis")
    @ResponseBody

    public TotalDispResult analysis(@RequestBody AnalysisRequest request) {

        return analysisService.analysis(
                request.getMass(),
                request.getStiffness(),
                request.getDamping(),
                request.getEarthquake(),
                request.getCsvText(),
                request.getData(),
                request.getDt()

        );
    }

}


