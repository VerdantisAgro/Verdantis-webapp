package lote

import (
	"context"
	"sort"
)

type Summary struct {
	TotalLotes          int     `json:"totalLotes"`
	LotesAtivos         int     `json:"lotesAtivos"`
	LotesFinalizados    int     `json:"lotesFinalizados"`
	ReceitaTotal        float64 `json:"receitaTotal"`
	CustoTotal          float64 `json:"custoTotal"`
	LucroTotal          float64 `json:"lucroTotal"`
	CulturaMaisRentavel string  `json:"culturaMaisRentavel"`
	LoteMaisRentavel    string  `json:"loteMaisRentavel"`
}

type MonthTotals struct {
	Mes     string  `json:"mes"`
	Receita float64 `json:"receita"`
	Custo   float64 `json:"custo"`
	Lucro   float64 `json:"lucro"`
}

func (s *Service) Summary(ctx context.Context, userID int64) (*Summary, error) {
	lotes, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}
	sum := &Summary{TotalLotes: len(lotes)}
	byCrop := map[string]float64{}
	bestLote := 0.0
	for i := range lotes {
		l := &lotes[i]
		if l.IsFinalized() {
			sum.LotesFinalizados++
		} else {
			sum.LotesAtivos++
		}
		sum.ReceitaTotal += l.Revenue()
		sum.CustoTotal += l.CostTotal
		sum.LucroTotal += l.Profit()
		byCrop[l.Crop] += l.Profit()
		if sum.LoteMaisRentavel == "" || l.Profit() > bestLote {
			sum.LoteMaisRentavel, bestLote = l.Name, l.Profit()
		}
	}
	bestCrop := 0.0
	for crop, profit := range byCrop {
		if sum.CulturaMaisRentavel == "" || profit > bestCrop || (profit == bestCrop && crop < sum.CulturaMaisRentavel) {
			sum.CulturaMaisRentavel, bestCrop = crop, profit
		}
	}
	sum.ReceitaTotal = round2(sum.ReceitaTotal)
	sum.CustoTotal = round2(sum.CustoTotal)
	sum.LucroTotal = round2(sum.LucroTotal)
	return sum, nil
}

// ProfitTrend groups lotes by month: the finalization month for finalized
// lotes, the creation month otherwise.
func (s *Service) ProfitTrend(ctx context.Context, userID int64) ([]MonthTotals, error) {
	lotes, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, err
	}
	months := map[string]*MonthTotals{}
	for i := range lotes {
		l := &lotes[i]
		when := l.CreatedAt
		if l.FinalizedAt != nil {
			when = *l.FinalizedAt
		}
		key := when.Format("2006-01")
		m, ok := months[key]
		if !ok {
			m = &MonthTotals{Mes: key}
			months[key] = m
		}
		m.Receita += l.Revenue()
		m.Custo += l.CostTotal
		m.Lucro += l.Profit()
	}
	out := make([]MonthTotals, 0, len(months))
	for _, m := range months {
		m.Receita, m.Custo, m.Lucro = round2(m.Receita), round2(m.Custo), round2(m.Lucro)
		out = append(out, *m)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Mes < out[j].Mes })
	return out, nil
}
