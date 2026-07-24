package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class LessonController {

    private final AnalysisService analysisService;

    public LessonController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // トップページ
    @GetMapping("/menu")
    public String menu() {
        return "menu";
    }

    // シミュレーション画面
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
                request.getCsvText()
        );
    }

    // CSVダウンロード
    @GetMapping("/downloadCsv")
    public ResponseEntity<byte[]> downloadCsv(
            @RequestParam(defaultValue = "サンプル") String name) {
        String csv =
                "階数,質量(ton),剛性(kN/mm)\n" +
                        "1,,\n" +
                        "2,,\n" +
                        "3,,\n";

        byte[] data = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);

        String encodedName =
                URLEncoder.encode(name, StandardCharsets.UTF_8)
                        .replace("+", "%20");
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedName + ".csv"
                )
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }


}


