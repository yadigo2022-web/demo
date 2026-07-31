package com.example.controller;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import org.ejml.data.DMatrixRMaj;
import org.ejml.dense.row.CommonOps_DDRM;
import org.ejml.dense.row.factory.DecompositionFactory_DDRM;
import org.ejml.interfaces.decomposition.EigenDecomposition_F64;

@Service
public class AnalysisService {

    public TotalDispResult analysis(
            List<Double> mass,
            List<Double> stiffness,
            double damping,
            String earthquake,
            String csvText,
            List<List<Double>> data,
            double dt) {

        System.out.println("===== 入力値 =====");
        System.out.println();

        // 減衰比
        System.out.println("減衰比");
        System.out.println(damping);


        System.out.println(dt);

        // 質量
        System.out.println("質量");

        for (int i = 0; i < mass.size(); i++) {
            System.out.println((i + 1) + "F : " + mass.get(i));
        }

        System.out.println();

        // 質量マトリクス
        double[][] M = new double[mass.size()][mass.size()];

        for (int i = 0; i < mass.size(); i++) {
            M[i][i] = mass.get(i);
        }

        // 確認
        for (double[] row : M) {
            System.out.println(Arrays.toString(row));
        }

        // 剛性
        System.out.println("剛性");

        for (int i = 0; i < stiffness.size(); i++) {
            System.out.println((i + 1) + "F : " + stiffness.get(i));
        }

        // 剛性マトリクス作成

        int N = stiffness.size();

        // (N+1)×(N+1) の一時行列
        double[][] Ktemp = new double[N + 1][N + 1];

        // kN/m → N/m に変換しながら剛性マトリクスを作成
        for (int i = 0; i < N; i++) {

            double k = stiffness.get(i) * 1000.0;

            Ktemp[i][i] += k;
            Ktemp[i][i + 1] = -k;
            Ktemp[i + 1][i] = -k;
            Ktemp[i + 1][i + 1] += k;
        }

        // 1行目・1列目を削除
        double[][] K = new double[N][N];

        for (int i = 1; i <= N; i++) {
            for (int j = 1; j <= N; j++) {
                K[i - 1][j - 1] = Ktemp[i][j];
            }
        }

        // 確認
        System.out.println("剛性マトリクス");

        for (double[] row : K) {
            System.out.println(Arrays.toString(row));
        }

        // =========================
        // 固有値解析
        // =========================

        DMatrixRMaj Mmat = new DMatrixRMaj(M);
        DMatrixRMaj Kmat = new DMatrixRMaj(K);
        DMatrixRMaj A = new DMatrixRMaj(M.length, M.length);

        // A = M^-1 K
        CommonOps_DDRM.solve(Mmat, Kmat, A);

        // 固有値分解
        EigenDecomposition_F64<DMatrixRMaj> eig =
                DecompositionFactory_DDRM.eig(M.length, true);

        eig.decompose(A);

        // 全て1のベクトル
        DMatrixRMaj ones = new DMatrixRMaj(M.length, 1);
        for (int i = 0; i < M.length; i++) {
            ones.set(i, 0, 1.0);
        }

        System.out.println();
        System.out.println("===== 固有値解析 =====");

        double[] w = new double[M.length];
        List<DMatrixRMaj> gammaPhiList = new ArrayList<>();

        for (int i = 0; i < M.length; i++) {

            //double lambda = eig.getEigenvalue(i).getReal();
            w[i] = Math.sqrt(eig.getEigenvalue(i).getReal()); //固有円振動数
            System.out.println("固有円振動数 = " + w[i]);


            System.out.println("--------------------------------");
            System.out.println((i + 1) + "次モード");
            System.out.println("固有値 = " + w);

            DMatrixRMaj mode = eig.getEigenVector(i);

            if (mode == null) {
                System.out.println("固有ベクトルなし");
                continue;
            }

            System.out.println("固有ベクトル");

            for (int j = 0; j < mode.getNumRows(); j++) {
                System.out.println(mode.get(j, 0));
            }

            // 分子 = mode^T M 1
            DMatrixRMaj temp1 = new DMatrixRMaj(M.length, 1);
            CommonOps_DDRM.mult(Mmat, ones, temp1);
            double numerator = innerProduct(mode, temp1);

            // 分母 = mode^T M mode
            DMatrixRMaj temp2 = new DMatrixRMaj(M.length, 1);
            CommonOps_DDRM.mult(Mmat, mode, temp2);
            double denominator = innerProduct(mode, temp2);

            double beta = numerator / denominator;

            System.out.println("刺激係数 β = " + beta);
            // β × 固有ベクトル
            DMatrixRMaj gammaPhi = mode.copy();   // modeを書き換えないためコピー
            CommonOps_DDRM.scale(beta, gammaPhi);

            // 保存
            gammaPhiList.add(gammaPhi);
        }


        List<List<DMatrixRMaj>> allDisp = new ArrayList<>();
        List<List<DMatrixRMaj>> allVel  = new ArrayList<>();
        List<List<DMatrixRMaj>> allAcc  = new ArrayList<>();
        test calculator = new test();

        for (int i = 0; i < w.length; i++) {

            AnalysisResult result = calculator.TimeHistoryAnalysis(w[i], damping, data, dt);

            List<Double> acc = result.getAcc();
            List<Double> vel = result.getVel();
            List<Double> disp = result.getDisp();
            List<Double> groundAccList = result.getGroundAcc();


            List<DMatrixRMaj> dispModeList = new ArrayList<>();
            List<DMatrixRMaj> velModeList  = new ArrayList<>();
            List<DMatrixRMaj> accModeList  = new ArrayList<>();

            DMatrixRMaj gammaPhi = gammaPhiList.get(i);

            for (int t = 0; t < disp.size(); t++) {

                DMatrixRMaj u = gammaPhi.copy();
                CommonOps_DDRM.scale(disp.get(t), u);
                dispModeList.add(u);

                DMatrixRMaj v = gammaPhi.copy();
                CommonOps_DDRM.scale(vel.get(t), v);
                velModeList.add(v);

                double totalAcc = acc.get(t) + groundAccList.get(t);

                DMatrixRMaj a = gammaPhi.copy();

                // (Γφ) × (モード加速度 + 地動加速度)
                CommonOps_DDRM.scale(totalAcc, a);

                accModeList.add(a);
            }

            allDisp.add(dispModeList);
            allVel.add(velModeList);
            allAcc.add(accModeList);

            System.out.println((i + 1) + "次モードの解析完了");
        }

        //============================
        // モード重畳（加速度・速度・変位）
        //============================

        List<DMatrixRMaj> totalAcc = new ArrayList<>();
        List<DMatrixRMaj> totalVel = new ArrayList<>();
        List<DMatrixRMaj> totalDispMatrix = new ArrayList<>();

        int timeSize = allAcc.get(0).size();

        for (int t = 0; t < timeSize; t++) {

            DMatrixRMaj sumAcc = new DMatrixRMaj(M.length, 1);
            DMatrixRMaj sumVel = new DMatrixRMaj(M.length, 1);
            DMatrixRMaj sumDisp = new DMatrixRMaj(M.length, 1);

            for (int mode = 0; mode < allAcc.size(); mode++) {

                // 加速度
                CommonOps_DDRM.addEquals(sumAcc, allAcc.get(mode).get(t));

                // 速度
                CommonOps_DDRM.addEquals(sumVel, allVel.get(mode).get(t));

                // 変位
                CommonOps_DDRM.addEquals(sumDisp, allDisp.get(mode).get(t));
            }

            totalAcc.add(sumAcc);
            totalVel.add(sumVel);
            totalDispMatrix.add(sumDisp);
        }
        System.out.println("=================");

        List<List<Double>> totalDispData = new ArrayList<>();

        for (DMatrixRMaj mat : totalDispMatrix) {

            List<Double> row = new ArrayList<>();

            for (int i = 0; i < mat.getNumRows(); i++) {
                row.add(mat.get(i, 0));
            }

            totalDispData.add(row);
        }

        System.out.println("all OK");

        return new TotalDispResult( totalDispData );


    }

    private double innerProduct(DMatrixRMaj a, DMatrixRMaj b) {

        double sum = 0.0;

        for (int i = 0; i < a.getNumRows(); i++) {
            sum += a.get(i, 0) * b.get(i, 0);
        }

        return sum;
    }



}