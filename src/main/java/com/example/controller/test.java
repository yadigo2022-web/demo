package com.example.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class test {
    public AnalysisResult TimeHistoryAnalysis(double w, double h, List<List<Double>> data, double dt) {

        //============================
        // 地震波データ読込
        //============================
        /*

        List<double[]> matrix = new ArrayList<>();
        List<Double> groundAccList = new ArrayList<>();

        try {

            ClassPathResource resource =
                    new ClassPathResource("csv/samplewave.csv");


            List<String> lines =
                    new BufferedReader(
                            new InputStreamReader(resource.getInputStream())
                    )
                            .lines()
                            .toList();


            for (int n = 1; n < lines.size(); n++) {

                String line = lines.get(n);

                if (line.isBlank()) {
                    continue;
                }


                String[] data = line.split(",");

                double[] row = new double[data.length];


                for (int i = 0; i < data.length; i++) {

                    row[i] = Double.parseDouble(data[i]);

                }


                matrix.add(row);


                // 地動加速度（2列目）
                groundAccList.add(row[1]);

            }


        } catch (IOException e) {

            e.printStackTrace();

            return null;

        }

         */


        //============================
        // 時刻歴応答解析
        //============================

        double y_acc = 0.0;
        double y_vel = 0.0;
        double y_dis = 0.0;

        List<Double> acc = new ArrayList<>();
        List<Double> vel = new ArrayList<>();
        List<Double> disp = new ArrayList<>();

        List<Double> time = new ArrayList<>();

        System.out.println(data.size());


        for (int i = 0; i < data.size(); i++) {

            // 地動加速度（dataの2列目）
            double groundAcc = data.get(i).get(1);

            // 次ステップ加速度
            double y_acc_next = -(
                    groundAcc
                            + 2.0 * h * w * (y_vel + 0.5 * y_acc * dt)
                            + w * w * (y_dis + y_vel * dt + 0.25 * y_acc * dt * dt)
            ) / (
                    1.0 + h * w * dt + 0.25 * w * w * dt * dt
            );

            // 次ステップ速度
            double y_vel_next = y_vel + 0.5 * (y_acc + y_acc_next) * dt;

            // 次ステップ変位
            double y_dis_next = y_dis + y_vel * dt
                    + 0.25 * (y_acc + y_acc_next) * dt * dt;

            // 保存
            acc.add(y_acc_next);
            vel.add(y_vel_next);
            disp.add(y_dis_next);

            // 更新
            y_acc = y_acc_next;
            y_vel = y_vel_next;
            y_dis = y_dis_next;

            // 時刻（dataの1列目）
            time.add(data.get(i).get(0));
        }


        // 結果を返す
        List<Double> groundAccList = new ArrayList<>();

        for (int i = 0; i < data.size(); i++) {

            groundAccList.add(data.get(i).get(1));

        }
        return new AnalysisResult(acc, vel, disp, groundAccList);
    }
}
